
import React, { useState, useRef, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { analyzeArticle, generateWordCloudImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ResultsDisplay } from './ResultsDisplay';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

const ArticleAnalyzer: React.FC = () => {
    const [articleFile, setArticleFile] = useState<File | null>(null);
    const [researchQuestions, setResearchQuestions] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [wordCloudImage, setWordCloudImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resultsRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setArticleFile(file);
            setError(null);
        } else {
            setArticleFile(null);
            if (file) {
                setError('Please select a valid PDF file.');
            }
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!articleFile || !researchQuestions.trim()) {
            setError('Please upload a PDF article and enter your research questions.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setWordCloudImage(null);

        try {
            const filePart = await fileToGenerativePart(articleFile);
            const result = await analyzeArticle(filePart, researchQuestions);
            setAnalysisResult(result);

            if (result.extracted_keywords && result.extracted_keywords.length > 0) {
                const imageUrl = await generateWordCloudImage(result.extracted_keywords);
                setWordCloudImage(imageUrl);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during analysis. Please check your API key and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [articleFile, researchQuestions]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Provide Article & Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="articleFile" className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Article (PDF)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Select the research article in PDF format for analysis.</p>
                         <div className="mt-1 flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm h-64 justify-center bg-gray-50">
                            <div className="text-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <label htmlFor="article-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none p-1">
                                    <span>Choose file</span>
                                    <input id="article-file-upload" name="article-file-upload" type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                                </label>
                                <p className="mt-1 text-sm text-gray-500 truncate max-w-xs">{articleFile ? articleFile.name : 'No file selected'}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="researchQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Research Questions (one per line)
                        </label>
                         <p className="text-xs text-gray-500 mb-2">Example: How does collaboration drive innovation in small businesses?</p>
                        <textarea
                            id="researchQuestions"
                            value={researchQuestions}
                            onChange={(e) => setResearchQuestions(e.target.value)}
                            placeholder="Enter your questions here..."
                            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                        />
                    </div>
                </div>
                 <div className="mt-6 text-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? 'Analyzing...' : 'Start Analysis'}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-lg border border-gray-200 min-h-[20rem]">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-4 text-center">Gemini is thinking... <br/>This complex analysis may take a moment.</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {analysisResult && (
                 <div ref={resultsRef}>
                    <ResultsDisplay result={analysisResult} wordCloudImage={wordCloudImage} />
                 </div>
            )}
        </div>
    );
};

export default ArticleAnalyzer;