'use client'

interface ProgressBarProps {
    correctAnswers: number;
    totalBlanks: number;
}

export function ProgressBar({ correctAnswers, totalBlanks }: ProgressBarProps) {
    const progressPercentage = totalBlanks > 0 ? (correctAnswers / totalBlanks) * 100 : 0;

    return (
        <div className="mb-8 px-12 sm:px-24 md:px-32 lg:px-48 xl:px-64">
            <div className="w-full bg-[#221D1D] rounded-full h-6">
                <div 
                    className="bg-[#00D3BE] h-6 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
} 