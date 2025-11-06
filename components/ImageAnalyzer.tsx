
import React, { useState, useCallback } from 'react';
import { analyzeImageWithPrompt } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

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


const ImageAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('Describe this image in detail.');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysisResult(null);
            setError(null);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageFile || !prompt) {
            setError('Please upload an image and provide a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const { inlineData } = await fileToGenerativePart(imageFile);
            const result = await analyzeImageWithPrompt(inlineData.data, inlineData.mimeType, prompt);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('An error occurred during image analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyze an Image</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Upload Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                             <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                     {previewUrl && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700">Preview:</p>
                            <img src={previewUrl} alt="Image preview" className="mt-2 rounded-lg shadow-md max-h-60 mx-auto" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col">
                    <div>
                        <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700 mb-2">2. Enter Your Prompt</label>
                        <textarea
                            id="imagePrompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-24 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !imageFile}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </button>
                    </div>

                    {isLoading && (
                       <div className="flex flex-col items-center justify-center mt-4 flex-grow">
                            <LoadingSpinner />
                            <p className="text-gray-600 mt-2">Gemini is analyzing the image...</p>
                        </div>
                    )}

                    {error && (
                         <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    {analysisResult && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex-grow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Analysis Result:</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{analysisResult}</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ImageAnalyzer;
