
import React, { useRef } from 'react';
import { AnalysisResult } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

interface ResultsDisplayProps {
    result: AnalysisResult;
    wordCloudImage: string | null;
}

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <svg key={i} className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }
    return <div className="flex">{stars}</div>;
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, wordCloudImage }) => {
    const resultsContentRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        const { jsPDF } = jspdf;
        const input = resultsContentRef.current;
        if (input) {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight >= pdfWidth / pdfHeight ? pdfWidth / imgWidth : pdfHeight / imgHeight;
            const canvasWidth = imgWidth * ratio;
            const canvasHeight = imgHeight * ratio;
            const marginX = (pdfWidth - canvasWidth) / 2;
            const marginY = (pdfHeight - canvasHeight) / 2;
            pdf.addImage(imgData, 'PNG', marginX, marginY, canvasWidth, canvasHeight);
            pdf.save('Research-Article-Analyzer-Report.pdf');
        }
    };
    
    const handleCopyToClipboard = () => {
        const content = resultsContentRef.current;
        if(content){
            const range = document.createRange();
            range.selectNode(content);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            try {
                document.execCommand('copy');
                alert('Results copied to clipboard! You can now paste it into Google Docs.');
            } catch (err) {
                alert('Failed to copy results.');
            }
            window.getSelection()?.removeAllRanges();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-4 mt-4">
                 <button onClick={handleCopyToClipboard} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    Export for Google Docs (Copy)
                </button>
                <button onClick={handleExportPDF} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Export as PDF
                </button>
            </div>
            <div ref={resultsContentRef} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 space-y-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Analysis Report</h2>

                {/* Structured Summary */}
                <section>
                    <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">Structured Summary</h3>
                    <div className="space-y-3 text-gray-600">
                        <p><strong>Title:</strong> {result.structured_summary.title}</p>
                        <p><strong>Authors:</strong> {result.structured_summary.authors.join(', ')}</p>
                        <p><strong>Year:</strong> {result.structured_summary.year}</p>
                        <p><strong>Objective:</strong> {result.structured_summary.objective}</p>
                        <p><strong>Method:</strong> {result.structured_summary.method}</p>
                        <div>
                            <strong>Key Findings:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                {result.structured_summary.key_findings.map((finding, index) => <li key={index}>{finding}</li>)}
                            </ul>
                        </div>
                        <p><strong>Implications:</strong> {result.structured_summary.implications}</p>
                        <p><strong>Limitations:</strong> {result.structured_summary.limitations}</p>
                    </div>
                </section>
                
                {/* Quality Check */}
                <section>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Quality Check Metrics</h4>
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="font-medium">Clarity of Research Question</p>
                                {renderStars(result.structured_summary.quality_check_metrics.clarity_of_research_question)}
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Rigor of Methodology</p>
                                {renderStars(result.structured_summary.quality_check_metrics.rigor_of_methodology)}
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Evidence Strength</p>
                                {renderStars(result.structured_summary.quality_check_metrics.evidence_strength)}
                            </div>
                        </div>
                        <p className="text-center italic text-gray-500 mt-4">"{result.structured_summary.quality_check_metrics.interpretation}"</p>
                    </div>
                </section>

                {/* Evaluation of Findings */}
                <section>
                    <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">Evaluation of Findings Against Research Questions</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-2 px-4 border-b">Research Question</th>
                                    <th className="text-left py-2 px-4 border-b">Related Findings/Evidence</th>
                                    <th className="text-left py-2 px-4 border-b">Relevance</th>
                                    <th className="text-left py-2 px-4 border-b">Brief Evaluation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.evaluation_of_findings.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b align-top w-1/4"><em>{item.research_question}</em></td>
                                        <td className="py-2 px-4 border-b align-top w-1/3">{item.related_findings_or_evidence}</td>
                                        <td className="py-2 px-4 border-b align-top w-1/6">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.relevance === 'High' ? 'bg-green-100 text-green-800' : item.relevance === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.relevance}</span>
                                        </td>
                                        <td className="py-2 px-4 border-b align-top w-1/4">{item.brief_evaluation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Overall Relevance Summary */}
                <section>
                    <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">Overall Relevance Summary</h3>
                    <p className="text-gray-600">{result.overall_relevance_summary}</p>
                </section>
                
                {/* Keywords and Visualization */}
                <section>
                     <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">Dominant Themes & Keywords</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {result.extracted_keywords.sort((a,b) => b.importance - a.importance).map((kw, i) => (
                            <span key={i} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{kw.keyword}</span>
                        ))}
                    </div>
                    {wordCloudImage ? (
                        <figure className="text-center">
                            <img src={wordCloudImage} alt="Keyword Cloud of Dominant Themes" className="mx-auto rounded-lg shadow-md border" />
                            <figcaption className="mt-2 text-sm text-gray-500 italic">Keyword Cloud of Dominant Themes</figcaption>
                             <a href={wordCloudImage} download="keyword-cloud.png" className="mt-4 inline-block bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                                Download Image
                            </a>
                        </figure>
                    ) : (
                         <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg min-h-[10rem]">
                            <p className="text-gray-500">Generating keyword cloud...</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
