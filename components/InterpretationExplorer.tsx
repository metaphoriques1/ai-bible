

import React, { useState, useEffect, useCallback } from 'react';
import { Interpretation, Theologian } from '../types';
import { getInterpretationsForPassage, getSynthesizedInterpretation, getBibleChapterText, getContextualizedScripture } from '../services/GeminiService';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import Select from './common/Select';
import Button from './common/Button';
import TextArea from './common/TextArea';
import Modal from './common/Modal';
import { SAMPLE_THEOLOGIANS } from '../services/MockDb'; 
import { LightBulbIcon, BookOpenIcon, SparklesIcon, XMarkIcon } from './common/IconComponents';
import { BIBLE_STRUCTURE, getBooksForTestament, getChaptersForBook, ALL_CHRISTIAN_TRADITIONS } from '../constants';

interface VerseContent {
  ref: string; // e.g., "John 1:1"
  text: string;
}

const InterpretationExplorer: React.FC = () => {
  const [selectedTestament, setSelectedTestament] = useState<string>('New Testament');
  const [selectedBook, setSelectedBook] = useState<string>('John');
  const [selectedChapter, setSelectedChapter] = useState<string>('1');
  
  const [currentChapterRef, setCurrentChapterRef] = useState<string>('John 1');
  const [chapterVerses, setChapterVerses] = useState<string[] | null>(null);
  const [isLoadingChapterText, setIsLoadingChapterText] = useState<boolean>(false);

  const [allTheologians] = useState<Theologian[]>(SAMPLE_THEOLOGIANS);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  
  const [bookOptions, setBookOptions] = useState<{value: string, label: string}[]>([]);
  const [chapterOptions, setChapterOptions] = useState<{value: string, label: string}[]>([]);

  // State for "Scripture in Your Situation"
  const [lifeSituationInput, setLifeSituationInput] = useState<string>('');
  const [contextualizedScripture, setContextualizedScripture] = useState<string | null>(null);
  const [isLoadingContextualScripture, setIsLoadingContextualScripture] = useState<boolean>(false);
  const [contextualizationError, setContextualizationError] = useState<string|null>(null);

  // State for Verse Detail Modal
  const [isVerseModalOpen, setIsVerseModalOpen] = useState<boolean>(false);
  const [selectedVerseContent, setSelectedVerseContent] = useState<VerseContent | null>(null);
  const [verseModalInterpretations, setVerseModalInterpretations] = useState<Interpretation[]>([]);
  const [verseModalSynthesis, setVerseModalSynthesis] = useState<string | null>(null);
  const [isLoadingVerseModalData, setIsLoadingVerseModalData] = useState<boolean>(false);
  const [verseModalError, setVerseModalError] = useState<string | null>(null);


  const initializeDropdowns = useCallback(() => {
    const initialBooks = getBooksForTestament('New Testament').map(book => ({ value: book.name, label: book.name }));
    setBookOptions(initialBooks);
    
    const johnChapters = getChaptersForBook('New Testament', 'John').map(chap => ({ value: chap.toString(), label: `Chapter ${chap}` }));
    setChapterOptions(johnChapters);
  }, []);

  useEffect(() => {
    initializeDropdowns();
  }, [initializeDropdowns]);


  const clearDependentSelections = (level: 'testament' | 'book') => {
    if (level === 'testament') {
      setSelectedBook('');
      setBookOptions([]);
    }
    setSelectedChapter('');
    setChapterOptions([]);
    setCurrentChapterRef('');
    setChapterVerses(null);
    setError(null);
    setContextualizedScripture(null); 
    setLifeSituationInput(''); 
    setContextualizationError(null);
    closeVerseModal(); // Close modal if selections change
  };
  
  const fetchChapterData = useCallback(async (book: string, chapter: string) => {
    if (!book || !chapter) return;
    const chapterRefForFetch = `${book} ${chapter}`;
    setCurrentChapterRef(chapterRefForFetch);
    setIsLoadingChapterText(true);
    setError(null);
    setChapterVerses(null);
    setContextualizedScripture(null);
    setContextualizationError(null);
    closeVerseModal();

    try {
      const versesArray = await getBibleChapterText(book, parseInt(chapter, 10));
      setChapterVerses(versesArray);
      if (versesArray.length === 0 || (versesArray.length === 1 && versesArray[0].startsWith("Error"))) {
        setError(`Could not load text for ${chapterRefForFetch}. The chapter might not be available or an error occurred.`);
      }
    } catch (err) {
      setError(`Failed to fetch chapter text for ${chapterRefForFetch}.`);
      console.error(err);
      setChapterVerses([`Error: Could not load text for ${chapterRefForFetch}.`]);
    } finally {
      setIsLoadingChapterText(false);
    }
  }, []); 

  useEffect(() => {
    if (selectedBook && selectedChapter) {
        fetchChapterData(selectedBook, selectedChapter);
    } else {
        // Clear data if book/chapter not fully selected (e.g. initial state before defaults fully apply)
        setChapterVerses(null);
        setCurrentChapterRef('');
    }
  }, [selectedBook, selectedChapter, fetchChapterData]);


  const handleTestamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTestament = e.target.value;
    setSelectedTestament(newTestament);
    clearDependentSelections('testament');
    if (newTestament) {
      setBookOptions(getBooksForTestament(newTestament).map(book => ({ value: book.name, label: book.name })));
    }
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBook = e.target.value;
    setSelectedBook(newBook);
    clearDependentSelections('book');
    if (selectedTestament && newBook) {
      setChapterOptions(getChaptersForBook(selectedTestament, newBook).map(chap => ({ value: chap.toString(), label: `Chapter ${chap}` })));
    }
  };
  
  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChapter(e.target.value);
    // Verse fetching is handled by useEffect on selectedBook and selectedChapter
  };

  const handleTraditionFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTraditions(options);
    // If modal is open, re-fetch data for the currently selected verse in modal
    if (isVerseModalOpen && selectedVerseContent) {
      fetchVerseDetailData(selectedVerseContent.ref);
    }
  };
  
  const fetchVerseDetailData = async (verseRef: string) => {
    if (selectedTraditions.length === 0) {
      setVerseModalError("Please select at least one Christian tradition to view interpretations.");
      setVerseModalInterpretations([]);
      setVerseModalSynthesis(null);
      return;
    }
    setIsLoadingVerseModalData(true);
    setVerseModalError(null);
    setVerseModalInterpretations([]);
    setVerseModalSynthesis(null);
    try {
      const [interpResults, synthesisResult] = await Promise.all([
        getInterpretationsForPassage(verseRef, selectedTraditions),
        getSynthesizedInterpretation(verseRef, selectedTraditions)
      ]);
      
      setVerseModalInterpretations(interpResults);
      setVerseModalSynthesis(synthesisResult);

      if (interpResults.length === 0 && !synthesisResult) {
        setVerseModalError(`No specific AI interpretations or synthesis found for "${verseRef}" with selected tradition filters.`);
      }
    } catch (err) {
      setVerseModalError(`Failed to fetch details for ${verseRef}. Please try again.`);
      console.error("Verse detail fetch error: ", err);
    } finally {
      setIsLoadingVerseModalData(false);
    }
  };

  const handleVerseClick = (verseText: string, verseNumber: number) => {
    if (!selectedBook || !selectedChapter) return;
    const verseRef = `${selectedBook} ${selectedChapter}:${verseNumber}`;
    setSelectedVerseContent({ ref: verseRef, text: verseText });
    setIsVerseModalOpen(true);
    fetchVerseDetailData(verseRef);
  };
  
  const closeVerseModal = () => {
    setIsVerseModalOpen(false);
    setSelectedVerseContent(null);
    setVerseModalInterpretations([]);
    setVerseModalSynthesis(null);
    setVerseModalError(null);
  };


  const handleGetContextualizedScripture = async () => {
    if (!currentChapterRef || !lifeSituationInput.trim()) {
      setContextualizationError("Please select a chapter and describe your situation.");
      return;
    }
    setIsLoadingContextualScripture(true);
    setContextualizedScripture(null);
    setContextualizationError(null);
    try {
      const result = await getContextualizedScripture(currentChapterRef, lifeSituationInput); // Using chapter ref
      setContextualizedScripture(result);
    } catch (err) {
      console.error("Error fetching contextualized scripture:", err);
      setContextualizationError("Failed to get contextualized scripture. Please try again.");
    } finally {
      setIsLoadingContextualScripture(false);
    }
  };

  const getTheologianDetails = (id?: string): Theologian | undefined => {
    if (!id) return undefined;
    return allTheologians.find(t => t.id === id);
  };

  const testamentOptions = BIBLE_STRUCTURE.map(t => ({ value: t.name, label: t.name }))
    .sort((a, b) => (a.value === 'New Testament' ? -1 : b.value === 'New Testament' ? 1 : a.value.localeCompare(b.value)));
    
  // Helper to extract verse number and text for display
  const parseVerseLine = (line: string): { number: string, text: string } => {
    const match = line.match(/^(\d+)\s+(.*)/);
    if (match) {
      return { number: match[1], text: match[2] };
    }
    return { number: '', text: line }; // Fallback if no number prefix
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpenIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Interpretation Explorer</h1>
      </div>
      
      <Card title="Select Bible Chapter" titleClassName="font-display text-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Testament" name="testamentSelector" value={selectedTestament} onChange={handleTestamentChange} options={testamentOptions} containerClassName="mb-0" />
          <Select label="Book" name="bookSelector" value={selectedBook} onChange={handleBookChange} options={bookOptions} disabled={!selectedTestament || bookOptions.length === 0} placeholder="Choose Book" containerClassName="mb-0" />
          <Select label="Chapter" name="chapterSelector" value={selectedChapter} onChange={handleChapterChange} options={chapterOptions} disabled={!selectedBook || chapterOptions.length === 0} placeholder="Choose Chapter" containerClassName="mb-0" />
        </div>
      </Card>

      <Card title="Filter by Christian Tradition(s)" titleClassName="font-display text-2xl">
         <Select
            name="traditionFilter"
            multiple
            value={selectedTraditions}
            onChange={handleTraditionFilterChange}
            options={ALL_CHRISTIAN_TRADITIONS}
            className="h-40 sm:h-32 text-base"
            placeholder="Select traditions (required for interpretations)..." 
          />
          {selectedTraditions.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one tradition to see verse interpretations.</p>}
       </Card>

      {isLoadingChapterText && <LoadingSpinner message={`Loading ${currentChapterRef}...`} />}
      
      {error && !isLoadingChapterText && (
          <Card className="border-red-500 border bg-red-50"><p className="text-red-700 p-2">{error}</p></Card>
      )}

      {!isLoadingChapterText && chapterVerses && chapterVerses.length > 0 && !error && (
        <Card title={`Scripture: ${currentChapterRef}`} className="bg-brand-surface" titleClassName="text-brand-primary font-display text-2xl">
          <div className="space-y-1 max-h-[60vh] overflow-y-auto p-2 rounded-md border border-brand-primary/10 bg-brand-background">
            {chapterVerses.map((verseLine, index) => {
              const verseData = parseVerseLine(verseLine);
              const verseNumberForRef = verseData.number || (index + 1).toString(); // Use index if no number parsed
              return (
                <p key={index} 
                   className="text-brand-text-primary font-serif text-base sm:text-lg leading-relaxed py-1 px-2 rounded hover:bg-brand-accent/10 cursor-pointer transition-colors duration-150"
                   onClick={() => handleVerseClick(verseData.text, parseInt(verseNumberForRef))}
                   role="button"
                   tabIndex={0}
                   onKeyPress={(e) => e.key === 'Enter' && handleVerseClick(verseData.text, parseInt(verseNumberForRef))}
                   aria-label={`View interpretations for verse ${verseNumberForRef}`}
                >
                  <strong className="text-brand-primary/70 mr-1.5 select-none">{verseData.number}</strong>{verseData.text}
                </p>
              );
            })}
          </div>
           <p className="text-xs text-brand-text-secondary text-center mt-3 italic">Click on a verse to explore interpretations.</p>
        </Card>
      )}
      
      {!isLoadingChapterText && !error && (!chapterVerses || chapterVerses.length === 0) && currentChapterRef && (
         <Card>
            <p className="text-brand-text-secondary text-center py-4">
              No verses loaded for "{currentChapterRef}". It might be an empty chapter or an issue with data.
            </p>
          </Card>
      )}
       {!currentChapterRef && !isLoadingChapterText && !error && (
         <Card>
            <p className="text-brand-text-secondary text-center py-4">
              Please select a Testament, Book, and Chapter to view scripture text.
            </p>
          </Card>
      )}

      {/* Scripture in Your Situation Section */}
      {currentChapterRef && chapterVerses && chapterVerses.length > 0 && (
        <Card title="Scripture in Your Situation" titleClassName="font-display text-2xl">
          <p className="text-brand-text-secondary mb-3 text-base">
            How can "{currentChapterRef}" speak into what you're facing right now?
          </p>
          <TextArea
            label="Describe your current life situation (e.g., burnout, parenting challenges, seeking guidance):"
            value={lifeSituationInput}
            onChange={(e) => {
              setLifeSituationInput(e.target.value);
              setContextualizationError(null); 
              setContextualizedScripture(null); 
            }}
            placeholder="e.g., Feeling overwhelmed with work and family responsibilities."
            rows={3}
            className="text-base"
          />
          <Button
            onClick={handleGetContextualizedScripture}
            isLoading={isLoadingContextualScripture}
            disabled={!currentChapterRef || !lifeSituationInput.trim() || isLoadingContextualScripture}
            leftIcon={<SparklesIcon className="w-5 h-5" />}
            variant="primary"
            className="mt-3"
          >
            Get Contextualized Scripture
          </Button>

          {isLoadingContextualScripture && <LoadingSpinner message="Applying scripture to your situation..." className="mt-4" />}
          
          {contextualizationError && !isLoadingContextualScripture && (
            <Card className="border-red-500 border bg-red-50 mt-4">
                <p className="text-red-700 p-2">{contextualizationError}</p>
            </Card>
          )}

          {contextualizedScripture && !isLoadingContextualScripture && !contextualizationError && (
            <div className="mt-4 p-4 bg-brand-primary/10 border-l-4 border-brand-primary rounded">
              <h4 className="font-semibold text-brand-primary mb-1">A Word for Your Situation (Context: {currentChapterRef}):</h4>
              <p className="text-brand-text-primary whitespace-pre-wrap text-base leading-relaxed">{contextualizedScripture}</p>
            </div>
          )}
        </Card>
      )}

      {/* Verse Detail Modal */}
      {isVerseModalOpen && selectedVerseContent && (
        <Modal 
          isOpen={isVerseModalOpen} 
          onClose={closeVerseModal} 
          title={`Interpretations for ${selectedVerseContent.ref}`}
          size="xl"
          footer={<Button onClick={closeVerseModal}>Close</Button>}
        >
          <div className="space-y-4">
            <Card title={`Verse: ${selectedVerseContent.ref}`} className="bg-brand-accent/10 border-brand-accent/30" titleClassName="text-brand-primary">
              <p className="text-brand-text-primary whitespace-pre-wrap font-serif text-lg leading-relaxed">{selectedVerseContent.text}</p>
            </Card>

            {isLoadingVerseModalData && <LoadingSpinner message={`Loading details for ${selectedVerseContent.ref}...`} />}
            {verseModalError && !isLoadingVerseModalData && <Card className="border-red-500 bg-red-50"><p className="text-red-700 p-2">{verseModalError}</p></Card>}

            {!isLoadingVerseModalData && !verseModalError && (
              <>
                {verseModalSynthesis && (
                  <Card title={`AI Synthesized Wisdom for ${selectedVerseContent.ref}`} className="bg-brand-primary/5 border-l-4 border-brand-primary" titleClassName="text-brand-primary text-lg">
                    <p className="text-brand-text-primary whitespace-pre-wrap text-base leading-relaxed">{verseModalSynthesis}</p>
                  </Card>
                )}

                {verseModalInterpretations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-display font-semibold text-brand-primary mb-2">
                      Interpretations
                      {selectedTraditions.length > 0 && ` (Filtered by: ${selectedTraditions.join(', ')})`}
                    </h3>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto p-1">
                      {verseModalInterpretations.map((interp) => {
                        const theologianDetails = getTheologianDetails(interp.theologianId);
                        const displayName = interp.theologianName || theologianDetails?.name || 'Unknown Theologian';
                        const displayTradition = interp.theologianTradition || theologianDetails?.tradition || 'General Interpretation';
                        const displayEra = theologianDetails?.era || '';

                        return (
                          <Card key={interp.id} title={displayName} className="bg-brand-surface shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-brand-text-secondary mb-1">
                              {displayEra ? `${displayEra} - ` : ''}{displayTradition}
                            </p>
                            <p className="text-brand-text-primary mb-1 text-sm">{interp.summary}</p>
                            {interp.keywords && interp.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {interp.keywords.map(kw => (
                                  <span key={kw} className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-xs rounded-full">{kw}</span>
                                ))}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!verseModalSynthesis && verseModalInterpretations.length === 0 && (
                  <p className="text-brand-text-secondary text-center py-3">No interpretations or synthesis available for this verse with the current filters.</p>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InterpretationExplorer;
