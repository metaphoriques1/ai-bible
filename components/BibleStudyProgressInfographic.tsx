
import React, { useMemo } from 'react';
import { BIBLE_STRUCTURE } from '../constants'; 
import { BibleBook, Testament } from '../types'; // Updated import
import Card from './common/Card';
import { ChartBarIcon } from './common/IconComponents';

interface BibleStudyProgressInfographicProps {
  readChapters: string[]; // Array of "Book Chapter", e.g., ["Genesis 1", "John 3"]
}

interface ProgressStats {
  totalChapters: number;
  otChapters: number;
  ntChapters: number;
  readOtChapters: number;
  readNtChapters: number;
  totalReadChapters: number;
  percentageOtRead: number;
  percentageNtRead: number;
  percentageTotalRead: number;
}

const BibleStudyProgressInfographic: React.FC<BibleStudyProgressInfographicProps> = ({ readChapters }) => {

  const stats: ProgressStats = useMemo(() => {
    let totalChapters = 0;
    let otChapters = 0;
    let ntChapters = 0;

    BIBLE_STRUCTURE.forEach(testament => {
      testament.books.forEach(book => {
        totalChapters += book.chapters;
        if (testament.name === 'Old Testament') {
          otChapters += book.chapters;
        } else {
          ntChapters += book.chapters;
        }
      });
    });

    let readOtChapters = 0;
    let readNtChapters = 0;

    const readChapterSet = new Set(readChapters);

    BIBLE_STRUCTURE.forEach(testament => {
      testament.books.forEach(book => {
        for (let i = 1; i <= book.chapters; i++) {
          if (readChapterSet.has(`${book.name} ${i}`)) {
            if (testament.name === 'Old Testament') {
              readOtChapters++;
            } else {
              readNtChapters++;
            }
          }
        }
      });
    });
    
    const totalReadChapters = readOtChapters + readNtChapters;

    return {
      totalChapters,
      otChapters,
      ntChapters,
      readOtChapters,
      readNtChapters,
      totalReadChapters,
      percentageOtRead: otChapters > 0 ? Math.round((readOtChapters / otChapters) * 100) : 0,
      percentageNtRead: ntChapters > 0 ? Math.round((readNtChapters / ntChapters) * 100) : 0,
      percentageTotalRead: totalChapters > 0 ? Math.round((totalReadChapters / totalChapters) * 100) : 0,
    };
  }, [readChapters]);

  const ProgressBar: React.FC<{ label: string, percentage: number, read: number, total: number, colorClass?: string }> = 
    ({ label, percentage, read, total, colorClass = 'bg-brand-accent' }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-base font-medium text-brand-text-primary">{label}</span>
        <span className="text-sm font-semibold text-brand-primary">{percentage}% ({read}/{total})</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3.5 dark:bg-gray-700">
        <div 
          className={`${colorClass} h-3.5 rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 p-1">
      <ProgressBar 
        label="Old Testament Read" 
        percentage={stats.percentageOtRead}
        read={stats.readOtChapters}
        total={stats.otChapters}
        colorClass="bg-sky-500"
      />
      <ProgressBar 
        label="New Testament Read" 
        percentage={stats.percentageNtRead}
        read={stats.readNtChapters}
        total={stats.ntChapters}
        colorClass="bg-emerald-500"
      />
      <ProgressBar 
        label="Total Bible Read" 
        percentage={stats.percentageTotalRead}
        read={stats.totalReadChapters}
        total={stats.totalChapters}
        colorClass="bg-brand-primary"
      />
       <p className="text-xs text-brand-text-secondary mt-4 text-center italic">
        Keep track of the chapters you've studied. Mark chapters as read in the Interpretation Explorer.
      </p>
    </div>
  );
};

export default BibleStudyProgressInfographic;