import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

interface FileStats {
  lines: number;
  chapters: number;
  sections: number;
  bullets: number;
}

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const calculateStats = (content: string): FileStats => {
    const lines = content.split('\n');
    return {
      lines: lines.length,
      chapters: lines.filter((l) => l.trim().startsWith('## ')).length,
      sections: lines.filter((l) => l.trim().startsWith('### ')).length,
      bullets: lines.filter((l) => l.trim().startsWith('* ')).length,
    };
  };

  const generateVintageHTML = (content: string, filename: string): string => {
    const lines = content.split('\n');
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.6;
      color: #2c2416;
      background-color: #f9f6f0;
      margin: 0;
      padding: 20px;
    }
    .cover {
      text-align: center;
      padding: 100px 20px;
      border: 3px double #6B4423;
      margin-bottom: 50px;
    }
    .cover h1 {
      font-size: 48px;
      color: #6B4423;
      margin: 20px 0;
      font-weight: bold;
    }
    .ornament {
      font-size: 36px;
      color: #8B6F47;
      margin: 20px 0;
    }
    .toc {
      margin: 30px 0;
      padding: 20px;
      background-color: #fff;
      border: 2px solid #6B4423;
    }
    .toc h2 {
      text-align: center;
      color: #6B4423;
      font-size: 28px;
    }
    .toc-item {
      margin: 10px 0;
      padding: 8px;
      border-bottom: 1px dotted #ccc;
    }
    .chapter {
      page-break-before: always;
      margin-top: 50px;
    }
    .chapter-number {
      font-size: 72px;
      color: #6B4423;
      text-align: center;
      margin: 20px 0;
    }
    .chapter-title {
      font-size: 36px;
      color: #6B4423;
      text-align: center;
      border-top: 3px double #6B4423;
      border-bottom: 3px double #6B4423;
      padding: 20px;
      margin: 20px 0;
    }
    .section {
      font-size: 24px;
      color: #6B4423;
      margin: 30px 0 15px 0;
      padding: 10px;
      background-color: #F5E6CC;
      border-left: 4px solid #6B4423;
    }
    .paragraph {
      text-align: justify;
      text-indent: 30px;
      margin: 15px 0;
      font-size: 14px;
    }
    .bullet-list {
      margin: 15px 0;
      padding-left: 40px;
    }
    .bullet-item {
      margin: 8px 0;
      font-size: 14px;
    }
    .bullet-item::before {
      content: '◆ ';
      color: #6B4423;
      font-weight: bold;
      margin-right: 8px;
    }
    strong {
      color: #6B4423;
      font-weight: bold;
    }
  </style>
</head>
<body>`;

    // Generate cover page
    const title = lines.find(l => l.trim().startsWith('# '))?.replace('# ', '').trim() || filename;
    html += `
  <div class="cover">
    <div class="ornament">❧</div>
    <h1>${title}</h1>
    <div class="ornament">❧</div>
    <p style="font-size: 18px; color: #8B6F47; margin-top: 30px;">
      A Vintage Textbook Edition
    </p>
  </div>`;

    // Generate Table of Contents
    const chapters = lines
      .map((line, idx) => ({ line, idx }))
      .filter(({ line }) => line.trim().startsWith('## '));
    
    if (chapters.length > 0) {
      html += `
  <div class="toc">
    <h2>Table of Contents</h2>`;
      chapters.forEach(({ line }, index) => {
        const chapterTitle = line.replace('## ', '').trim();
        html += `
    <div class="toc-item">
      <strong>Chapter ${index + 1}:</strong> ${chapterTitle}
    </div>`;
      });
      html += `
  </div>`;
    }

    // Process content
    let chapterCount = 0;
    let inBulletList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('# ')) {
        continue; // Skip title as it's in cover
      } else if (line.startsWith('## ')) {
        if (inBulletList) {
          html += '</div>';
          inBulletList = false;
        }
        chapterCount++;
        const chapterTitle = line.replace('## ', '').trim();
        html += `
  <div class="chapter">
    <div class="chapter-number">${chapterCount}</div>
    <div class="chapter-title">${chapterTitle}</div>
  </div>`;
      } else if (line.startsWith('### ')) {
        if (inBulletList) {
          html += '</div>';
          inBulletList = false;
        }
        const sectionTitle = line.replace('### ', '').trim();
        html += `
  <div class="section">${sectionTitle}</div>`;
      } else if (line.startsWith('* ')) {
        if (!inBulletList) {
          html += '<div class="bullet-list">';
          inBulletList = true;
        }
        let bulletText = line.replace('* ', '').trim();
        bulletText = bulletText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `
    <div class="bullet-item">${bulletText}</div>`;
      } else if (line.length > 0) {
        if (inBulletList) {
          html += '</div>';
          inBulletList = false;
        }
        let paragraphText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `
  <p class="paragraph">${paragraphText}</p>`;
      }
    }

    if (inBulletList) {
      html += '</div>';
    }

    html += `
</body>
</html>`;

    return html;
  };

  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.plainText],
      });

      if (result && result[0]) {
        const file = result[0];
        setSelectedFile(file);

        // Read file content
        const content = await RNFS.readFile(file.uri, 'utf8');
        setFileContent(content);

        // Calculate statistics
        const stats = calculateStats(content);
        setFileStats(stats);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking document:', error);
        Alert.alert('Error', 'Failed to load file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a text file first.');
      return;
    }

    try {
      setGenerating(true);

      // Generate vintage HTML from markdown content
      const htmlContent = generateVintageHTML(fileContent, selectedFile.name || 'document');

      // Generate PDF on device using react-native-html-to-pdf
      const options = {
        html: htmlContent,
        fileName: `vintage_textbook_${Date.now()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      
      if (!file.filePath) {
        throw new Error('Failed to generate PDF');
      }

      // Share/Save the file
      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: 'Save Vintage PDF',
      });
      
      Alert.alert(
        'Success! 🎉',
        'Your vintage textbook PDF has been generated and saved!'
      );
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      if (error.message !== 'User did not share') {
        Alert.alert(
          'Error',
          'Failed to generate PDF. Please try again.'
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="book" size={40} color="#6B4423" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Vintage PDF</Text>
            <Text style={styles.subtitle}>Textbook Generator</Text>
          </View>
        </View>
        <Text style={styles.description}>
          Transform your notes into beautifully formatted vintage textbooks
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* File Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Text File</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickDocument}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  {selectedFile ? 'Change File' : 'Choose .txt File'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* File Preview Section */}
        {selectedFile && (
          <View style={styles.section}>
            <View style={styles.fileInfo}>
              <Icon name="document-text" size={24} color="#6B4423" />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>
                  {selectedFile.size ? (selectedFile.size / 1024).toFixed(2) : '0'} KB
                </Text>
              </View>
            </View>

            {/* Document Statistics */}
            {fileStats && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Document Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{fileStats.lines}</Text>
                    <Text style={styles.statLabel}>Lines</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{fileStats.chapters}</Text>
                    <Text style={styles.statLabel}>Chapters</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{fileStats.sections}</Text>
                    <Text style={styles.statLabel}>Sections</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{fileStats.bullets}</Text>
                    <Text style={styles.statLabel}>Bullets</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Content Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Preview</Text>
              <ScrollView style={styles.previewScroll} nestedScrollEnabled>
                <Text style={styles.previewText}>
                  {fileContent.split('\n').slice(0, 50).join('\n')}
                  {fileContent.split('\n').length > 50 &&
                    '\n\n... (preview truncated)'}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* PDF Features */}
        {selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PDF Features</Text>
            <View style={styles.featuresList}>
              {[
                'Two-column vintage layout',
                'Automatic table of contents',
                'Chapter numbering',
                'Decorative borders & bullets',
                'Professional typography',
                'Page numbers',
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={20} color="#6B4423" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Generate Button */}
        {selectedFile && (
          <TouchableOpacity
            style={[
              styles.generateButton,
              generating && styles.generateButtonDisabled,
            ]}
            onPress={generatePDF}
            disabled={generating}
          >
            {generating ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateButtonText}>Generating PDF...</Text>
              </>
            ) : (
              <>
                <Icon name="create-outline" size={24} color="#fff" />
                <Text style={styles.generateButtonText}>Generate PDF</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Format Guide */}
        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>Formatting Guide</Text>
          <View style={styles.guideItem}>
            <Text style={styles.guideCode}># Title</Text>
            <Text style={styles.guideDescription}>Main document title</Text>
          </View>
          <View style={styles.guideItem}>
            <Text style={styles.guideCode}>## Chapter</Text>
            <Text style={styles.guideDescription}>Chapter headers</Text>
          </View>
          <View style={styles.guideItem}>
            <Text style={styles.guideCode}>### Section</Text>
            <Text style={styles.guideDescription}>Section headers</Text>
          </View>
          <View style={styles.guideItem}>
            <Text style={styles.guideCode}>* Bullet</Text>
            <Text style={styles.guideDescription}>Bullet points</Text>
          </View>
          <View style={styles.guideItem}>
            <Text style={styles.guideCode}>**Bold**</Text>
            <Text style={styles.guideDescription}>Bold text</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#F5E6CC',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B6F47',
    marginTop: -2,
  },
  description: {
    fontSize: 14,
    color: '#6B5843',
    marginTop: 8,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B4423',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5E6CC',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4423',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B6F47',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewScroll: {
    maxHeight: 200,
  },
  previewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  generateButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  guideSection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideCode: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#6B4423',
    fontWeight: '600',
    backgroundColor: '#F5E6CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 100,
  },
  guideDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});
