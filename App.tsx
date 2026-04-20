import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import React, { useState, useEffect, useRef, useMemo } from "react";
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

type Screen = "home" | "daily" | "chapters" | "reading";

interface DailyVersesData {
  book: BibleBook;
  chapter: number;
  verses: Verse[];
  translation: BibleTranslation;
}

interface ReadingData {
  book: BibleBook;
  chapter: number;
  verses: Verse[];
  translation: BibleTranslation;
}

// Snow flake component
const FLAKE_COUNT = 20;

interface Flake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function SnowEffect(): React.ReactElement {
  // Inject CSS keyframe on web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const styleId = "snowfall-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `@keyframes snowfall { from { transform: translateY(-10px); } to { transform: translateY(220px); } }`;
      document.head.appendChild(style);
    }
  }, []);
  const flakes = useMemo<Flake[]>(
    () =>
      Array.from({ length: FLAKE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 5 + 3,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.5 + 0.3,
      })),
    [],
  );

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        borderRadius: 12,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {flakes.map((flake) => (
        <View
          key={flake.id}
          style={{
            position: "absolute",
            left: `${flake.x}%`,
            top: -10,
            width: flake.size,
            height: flake.size,
            borderRadius: flake.size / 2,
            backgroundColor: "#c0c0c0",
            opacity: flake.opacity,
            shadowColor: "#c0c0c0",
            shadowRadius: 2,
            shadowOpacity: 0.8,
            // @ts-expect-error web-only CSS animation
            animationName: "snowfall",
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
          }}
        />
      ))}
    </View>
  );
}

export default function App(): React.ReactElement {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [dailyVerses, setDailyVerses] = useState<DailyVersesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("acf");
  const [showTranslationModal, setShowTranslationModal] =
    useState<boolean>(false);
  const [dbInitializing, setDbInitializing] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [chapterLoading, setChapterLoading] = useState<boolean>(false);
  const [showPixModal, setShowPixModal] = useState<boolean>(false);
  const [selectedTestament, setSelectedTestament] = useState<
    "old" | "new" | null
  >(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
      alert("Erro ao carregar versículos. Tente novamente.");
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

  const openBook = (book: BibleBook): void => {
    setSelectedBook(book);
    setCurrentScreen("chapters");
  };

  const openChapter = async (
    book: BibleBook,
    chapter: number,
    direction: "next" | "prev" | "none" = "none",
  ): Promise<void> => {
    setChapterLoading(true);
    try {
      const chapterData = await fetchChapter(
        book.id,
        chapter,
        selectedTranslation,
      );
      const newData: ReadingData = {
        book,
        chapter,
        verses: chapterData.verses || [],
        translation: currentTranslation,
      };

      if (direction === "none" || currentScreen !== "reading") {
        slideAnim.setValue(0);
        setReadingData(newData);
        setCurrentScreen("reading");
      } else {
        const outTo = direction === "next" ? -SCREEN_WIDTH : SCREEN_WIDTH;
        const inFrom = direction === "next" ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(slideAnim, {
          toValue: outTo,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setReadingData(newData);
          slideAnim.setValue(inFrom);
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }).start();
        });
      }
    } catch (error) {
      console.error("Error loading chapter:", error);
      alert("Erro ao carregar capítulo. Tente novamente.");
    } finally {
      setChapterLoading(false);
    }
  };

  const renderBookItem = ({
    item,
  }: {
    item: BibleBook;
  }): React.ReactElement => (
    <TouchableOpacity style={styles.bookItem} onPress={() => openBook(item)}>
      <Text style={styles.bookAbbreviation}>{item.abbreviation}</Text>
      <Text style={styles.bookName}>{item.name}</Text>
      <Text style={styles.chapterCount}>{item.chapters} cap.</Text>
    </TouchableOpacity>
  );

  const renderTestamentTabs = (): React.ReactElement => (
    <View style={styles.testamentTabsRow}>
      <TouchableOpacity
        style={[
          styles.testamentTab,
          selectedTestament === "old" && styles.testamentTabActive,
        ]}
        onPress={() => setSelectedTestament("old")}
      >
        <Text
          style={[
            styles.testamentTabText,
            selectedTestament === "old" && styles.testamentTabTextActive,
          ]}
        >
          Antigo Testamento
        </Text>
        <Text
          style={[
            styles.testamentTabCount,
            selectedTestament === "old" && styles.testamentTabTextActive,
          ]}
        >
          {BIBLE_BOOKS.oldTestament.length} livros
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.testamentTab,
          selectedTestament === "new" && styles.testamentTabActive,
        ]}
        onPress={() => setSelectedTestament("new")}
      >
        <Text
          style={[
            styles.testamentTabText,
            selectedTestament === "new" && styles.testamentTabTextActive,
          ]}
        >
          Novo Testamento
        </Text>
        <Text
          style={[
            styles.testamentTabCount,
            selectedTestament === "new" && styles.testamentTabTextActive,
          ]}
        >
          {BIBLE_BOOKS.newTestament.length} livros
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPixModal = (): React.ReactElement => (
    <Modal
      visible={showPixModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPixModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pixModalContent}>
          <Text style={styles.pixModalTitle}>💚 Contribua com o App</Text>
          <Text style={styles.pixModalText}>
            Você poderá contribuir com a quantia de{" "}
            <Text style={styles.pixModalHighlight}>R$ 1,00 (um real)</Text> para
            ajudar os desenvolvedores desse app.
          </Text>
          <View style={styles.pixKeyBox}>
            <Text style={styles.pixKeyLabel}>Chave Pix</Text>
            <Text style={styles.pixKeyValue}>85999401626</Text>
          </View>
          <Text style={styles.pixModalFooter}>
            A equipe agradece antecipadamente e Deus lhe abençoe para todo
            sempre. Amém. 🙏
          </Text>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowPixModal(false)}
          >
            <Text style={styles.closeModalButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPixButton = (): React.ReactElement => (
    <TouchableOpacity
      style={styles.pixFloatingButton}
      onPress={() => setShowPixModal(true)}
    >
      <Text style={styles.pixFloatingButtonText}>Pix</Text>
    </TouchableOpacity>
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
        <SnowEffect />
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
          Receba 5 versículos inspirados de um livro aleatório da Bíblia
        </Text>
      </View>

      {renderTestamentTabs()}

      {selectedTestament !== null && (
        <FlatList
          data={
            selectedTestament === "old"
              ? BIBLE_BOOKS.oldTestament
              : BIBLE_BOOKS.newTestament
          }
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

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

  const renderChaptersScreen = (): React.ReactElement => {
    if (!selectedBook) return renderHomeScreen();
    const chapters = Array.from(
      { length: selectedBook.chapters },
      (_, i) => i + 1,
    );
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentScreen("home")}
            style={styles.backIcon}
          >
            <Text style={styles.backIconText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedBook.name}</Text>
          <Text style={styles.headerSubtitle}>
            {selectedBook.chapters} capítulos
          </Text>
        </View>
        {chapterLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Carregando capítulo...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.chaptersGrid}>
            {chapters.map((ch) => (
              <TouchableOpacity
                key={ch}
                style={styles.chapterButton}
                onPress={() => openChapter(selectedBook, ch)}
              >
                <Text style={styles.chapterButtonText}>{ch}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <StatusBar style="light" />
      </View>
    );
  };

  const renderReadingScreen = (): React.ReactElement => {
    if (!readingData) return renderHomeScreen();
    const { book, chapter, verses, translation } = readingData;
    const allBooks = getAllBooks();
    const bookIndex = allBooks.findIndex((b) => b.id === book.id);

    // Within-book navigation
    const prevChapter = chapter > 1 ? chapter - 1 : null;
    const nextChapter = chapter < book.chapters ? chapter + 1 : null;

    // Cross-book navigation (when at first/last chapter of a book)
    const prevBook = bookIndex > 0 ? allBooks[bookIndex - 1] : null;
    const nextBook =
      bookIndex < allBooks.length - 1 ? allBooks[bookIndex + 1] : null;

    const handleNext = (): void => {
      if (nextChapter) {
        openChapter(book, nextChapter, "next");
      } else if (nextBook) {
        setSelectedBook(nextBook);
        openChapter(nextBook, 1, "next");
      }
    };

    const handlePrev = (): void => {
      if (prevChapter) {
        openChapter(book, prevChapter, "prev");
      } else if (prevBook) {
        setSelectedBook(prevBook);
        openChapter(prevBook, prevBook.chapters, "prev");
      }
    };

    const canGoNext = nextChapter !== null || nextBook !== null;
    const canGoPrev = prevChapter !== null || prevBook !== null;

    const nextLabel = nextChapter
      ? "Próximo ›"
      : nextBook
        ? `${nextBook.abbreviation} ›`
        : "Próximo ›";
    const prevLabel = prevChapter
      ? "‹ Anterior"
      : prevBook
        ? `‹ ${prevBook.abbreviation}`
        : "‹ Anterior";

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentScreen("chapters")}
            style={styles.backIcon}
          >
            <Text style={styles.backIconText}>← Capítulos</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {book.name} {chapter}
          </Text>
          <Text style={styles.headerSubtitle}>
            {translation.abbreviation} — {translation.name}
          </Text>
        </View>
        <Animated.ScrollView
          style={[
            styles.versesContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {verses.map((verse, index) => (
            <View key={index} style={styles.verseCard}>
              <Text style={styles.verseNumber}>{verse.verse}</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </Animated.ScrollView>
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
            onPress={handlePrev}
            disabled={!canGoPrev || chapterLoading}
          >
            <Text style={styles.navButtonText}>{prevLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chapterBadge}
            onPress={() => setCurrentScreen("chapters")}
          >
            <Text style={styles.chapterBadgeText}>{chapter}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!canGoNext || chapterLoading}
          >
            <Text style={styles.navButtonText}>{nextLabel}</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  };

  if (dbInitializing) {
    return renderLoadingScreen();
  }

  let screenContent: React.ReactElement;
  if (currentScreen === "home") screenContent = renderHomeScreen();
  else if (currentScreen === "daily") screenContent = renderDailyScreen();
  else if (currentScreen === "chapters") screenContent = renderChaptersScreen();
  else screenContent = renderReadingScreen();

  return (
    <View style={{ flex: 1 }}>
      {screenContent}
      {renderPixButton()}
      {renderPixModal()}
    </View>
  );
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
  testamentTabsRow: {
    flexDirection: "row",
    backgroundColor: "#2c3e50",
    paddingHorizontal: 2,
    paddingVertical: 2,
    gap: 4,
  },
  testamentTab: {
    flex: 1,
    backgroundColor: "#3d5166",
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: "center",
  },
  testamentTabActive: {
    backgroundColor: "#2ecc71",
  },
  testamentTabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#bdc3c7",
  },
  testamentTabTextActive: {
    color: "#fff",
  },
  testamentTabCount: {
    fontSize: 11,
    color: "#bdc3c7",
    marginTop: 2,
  },
  sectionHeader: {
    backgroundColor: "#34495e",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  bookItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  bookAbbreviation: {
    width: 40,
    fontSize: 13,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  bookName: {
    flex: 1,
    fontSize: 15,
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
    overflow: "hidden",
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
  // Chapter grid
  chaptersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
    justifyContent: "flex-start",
  },
  chapterButton: {
    width: 56,
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  chapterButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  // Navigation
  backIcon: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backIconText: {
    color: "#bdc3c7",
    fontSize: 14,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#2c3e50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  chapterBadge: {
    width: 56,
    height: 56,
    backgroundColor: "#e74c3c",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  chapterBadgeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Pix floating button
  pixFloatingButton: {
    position: "absolute",
    top: 52,
    right: 16,
    backgroundColor: "#27ae60",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  pixFloatingButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // Pix modal
  pixModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  pixModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 14,
    textAlign: "center",
  },
  pixModalText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  pixModalHighlight: {
    fontWeight: "bold",
    color: "#27ae60",
  },
  pixKeyBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#27ae60",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  pixKeyLabel: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  pixKeyValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#27ae60",
    letterSpacing: 1,
  },
  pixModalFooter: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    fontStyle: "italic",
  },
});
