import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  ScrollView,
  ActivityIndicator,
  Modal,
  SectionListData,
  ListRenderItem,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  BIBLE_BOOKS,
  getAllBooks,
  fetchChapter,
  getAllTranslations,
  getTranslationById,
  BibleBook,
  BibleTranslation,
  ChapterData,
  Verse,
} from "./src/api/bibleApi";
import { initializeDatabase } from "./src/database/database";
import { initializeDatabaseData } from "./src/services/syncService";

type Screen = "home" | "daily";

interface DailyVersesData {
  book: BibleBook;
  chapter: number;
  verses: Verse[];
  translation: BibleTranslation;
}

interface BookSection {
  title: string;
  data: BibleBook[];
}

export default function App(): React.ReactElement {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [dailyVerses, setDailyVerses] = useState<DailyVersesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("acf");
  const [showTranslationModal, setShowTranslationModal] =
    useState<boolean>(false);
  const [dbInitializing, setDbInitializing] = useState<boolean>(true);

  // Initialize database on app startup (only on native platforms)
  useEffect(() => {
    const initDb = async (): Promise<void> => {
      // Skip database initialization on web platform
      if (Platform.OS === "web") {
        console.log("Running on web - skipping database initialization");
        setDbInitializing(false);
        return;
      }

      try {
        await initializeDatabase();
        await initializeDatabaseData();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setDbInitializing(false);
      }
    };

    initDb();
  }, []);

  const translations = getAllTranslations();
  const currentTranslation = getTranslationById(selectedTranslation);

  const sections: BookSection[] = [
    { title: "Antigo Testamento", data: BIBLE_BOOKS.oldTestament },
    { title: "Novo Testamento", data: BIBLE_BOOKS.newTestament },
  ];

  const generateDailyBread = async (): Promise<void> => {
    setLoading(true);
    try {
      // Get all books and select a random one
      const allBooks = getAllBooks();
      const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];

      // Select a random chapter
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;

      // Fetch the chapter with selected translation
      const chapterData = await fetchChapter(
        randomBook.id,
        randomChapter,
        selectedTranslation,
      );

      // Get 5 random verses from the chapter
      const verses = chapterData.verses || [];
      const selectedVerses: Verse[] = [];

      if (verses.length > 0) {
        const numVersesToSelect = Math.min(5, verses.length);
        const usedIndices = new Set<number>();

        while (selectedVerses.length < numVersesToSelect) {
          const randomIndex = Math.floor(Math.random() * verses.length);
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedVerses.push(verses[randomIndex]);
          }
        }

        // Sort verses by verse number
        selectedVerses.sort((a, b) => a.verse - b.verse);
      }

      setDailyVerses({
        book: randomBook,
        chapter: randomChapter,
        verses: selectedVerses,
        translation: currentTranslation,
      });
      setCurrentScreen("daily");
    } catch (error) {
      console.error("Error generating daily bread:", error);
      alert("Erro ao carregar vercículos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderTranslationModal = (): React.ReactElement => (
    <Modal
      visible={showTranslationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTranslationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Escolha a Tradução</Text>
          <ScrollView>
            {translations.map((translation) => (
              <TouchableOpacity
                key={translation.id}
                style={[
                  styles.translationItem,
                  selectedTranslation === translation.id &&
                    styles.translationItemSelected,
                ]}
                onPress={() => {
                  setSelectedTranslation(translation.id);
                  setShowTranslationModal(false);
                }}
              >
                <Text
                  style={[
                    styles.translationAbbreviation,
                    selectedTranslation === translation.id &&
                      styles.translationTextSelected,
                  ]}
                >
                  {translation.abbreviation}
                </Text>
                <Text
                  style={[
                    styles.translationName,
                    selectedTranslation === translation.id &&
                      styles.translationTextSelected,
                  ]}
                >
                  {translation.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowTranslationModal(false)}
          >
            <Text style={styles.closeModalButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBookItem: ListRenderItem<BibleBook> = ({ item }) => (
    <TouchableOpacity style={styles.bookItem}>
      <Text style={styles.bookAbbreviation}>{item.abbreviation}</Text>
      <Text style={styles.bookName}>{item.name}</Text>
      <Text style={styles.chapterCount}>{item.chapters} cap.</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (info: {
    section: SectionListData<BibleBook, BookSection>;
  }): React.ReactElement => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{info.section.title}</Text>
    </View>
  );

  const renderLoadingScreen = (): React.ReactElement => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#e74c3c" />
      <Text style={styles.loadingText}>Inicializando Bíblia...</Text>
    </View>
  );

  const renderHomeScreen = (): React.ReactElement => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bíblia Sagrada</Text>
        <Text style={styles.headerSubtitle}>{getAllBooks().length} livros</Text>
      </View>

      <View style={styles.dailyBreadContainer}>
        <TouchableOpacity
          style={styles.translationSelector}
          onPress={() => setShowTranslationModal(true)}
        >
          <Text style={styles.translationLabel}>Tradução:</Text>
          <Text style={styles.translationValue}>
            {currentTranslation.abbreviation} - {currentTranslation.name}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dailyBreadButton}
          onPress={generateDailyBread}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.dailyBreadButtonText}>Pão Diário</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.dailyBreadDescription}>
          Receba 5 vercículos inspirados de um livro aleatório da Bíblia
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {renderTranslationModal()}
      <StatusBar style="light" />
    </View>
  );

  const renderDailyScreen = (): React.ReactElement => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pão Diário</Text>
        <Text style={styles.headerSubtitle}>
          {dailyVerses?.book.name} {dailyVerses?.chapter}
        </Text>
        <Text style={styles.translationInfo}>
          {dailyVerses?.translation.abbreviation}
        </Text>
      </View>

      <ScrollView style={styles.versesContainer}>
        {dailyVerses?.verses.map((verse, index) => (
          <View key={index} style={styles.verseCard}>
            <Text style={styles.verseNumber}>{verse.verse}</Text>
            <Text style={styles.verseText}>{verse.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("home")}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newButton}
          onPress={generateDailyBread}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.newButtonText}>Novo Pão Diário</Text>
          )}
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />
    </View>
  );

  if (dbInitializing) {
    return renderLoadingScreen();
  }

  return currentScreen === "home" ? renderHomeScreen() : renderDailyScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#2c3e50",
  },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#bdc3c7",
    marginTop: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: "#34495e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bookItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  bookAbbreviation: {
    width: 40,
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  bookName: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  chapterCount: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  // Pão Diário styles
  dailyBreadContainer: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  translationSelector: {
    width: "100%",
    backgroundColor: "#ecf0f1",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  translationLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  translationValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  dailyBreadButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  dailyBreadButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  dailyBreadDescription: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  versesContainer: {
    flex: 1,
    padding: 15,
  },
  verseCard: {
    backgroundColor: "#fff",
    padding: 18,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 8,
  },
  verseText: {
    fontSize: 16,
    color: "#2c3e50",
    lineHeight: 24,
  },
  bottomButtons: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#95a5a6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  newButton: {
    flex: 2,
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  newButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  translationInfo: {
    fontSize: 12,
    color: "#bdc3c7",
    marginTop: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  translationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  translationItemSelected: {
    backgroundColor: "#3498db",
    borderRadius: 8,
  },
  translationAbbreviation: {
    width: 50,
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  translationName: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  translationTextSelected: {
    color: "#fff",
  },
  closeModalButton: {
    backgroundColor: "#95a5a6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
