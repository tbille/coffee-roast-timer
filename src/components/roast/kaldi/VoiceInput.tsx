import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Activity } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTemperature?: (temp: number) => void;
  onCommand?: (command: VoiceCommand) => void;
  disabled?: boolean;
  className?: string;
}

export type VoiceCommand = 'first-crack' | 'second-crack' | 'start' | 'stop';

/**
 * Parse spoken numbers to numeric values
 * Examples: "one hundred ninety two" -> 192
 *           "two hundred five" -> 205
 *           "one eighty five" -> 185
 */
const parseSpokenNumber = (text: string): number | null => {
  const normalized = text.toLowerCase().trim();
  
  // Direct number match (e.g., "192", "205")
  const directMatch = normalized.match(/\b(\d+)\b/);
  if (directMatch) {
    return parseInt(directMatch[1], 10);
  }

  // Word number mapping
  const ones: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
  };
  
  const tens: Record<string, number> = {
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
    'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
    'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
    'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
    'eighty': 80, 'ninety': 90
  };

  let total = 0;
  let current = 0;
  
  const words = normalized.split(/\s+/);
  
  for (const word of words) {
    if (word === 'hundred') {
      current *= 100;
    } else if (word === 'thousand') {
      current *= 1000;
      total += current;
      current = 0;
    } else if (ones[word] !== undefined) {
      current += ones[word];
    } else if (tens[word] !== undefined) {
      current += tens[word];
    }
  }
  
  total += current;
  
  // Validate temperature range (0-300°C)
  if (total > 0 && total <= 300) {
    return total;
  }
  
  return null;
};

/**
 * Detect voice commands from transcript
 */
const detectCommand = (text: string): VoiceCommand | null => {
  const normalized = text.toLowerCase().trim();
  
  if (normalized.includes('first crack') || normalized.includes('1st crack')) {
    return 'first-crack';
  }
  if (normalized.includes('second crack') || normalized.includes('2nd crack')) {
    return 'second-crack';
  }
  if (normalized === 'start' || normalized === 'begin') {
    return 'start';
  }
  if (normalized === 'stop' || normalized === 'end') {
    return 'stop';
  }
  
  return null;
};

export const VoiceInput = ({
  onTemperature,
  onCommand,
  disabled = false,
  className
}: VoiceInputProps) => {
  const [lastProcessed, setLastProcessed] = useState<string>('');
  const [parsedValue, setParsedValue] = useState<number | null>(null);
  const [detectedCommand, setDetectedCommand] = useState<VoiceCommand | null>(null);

  const handleResult = useCallback((result: any) => {
    if (!result.isFinal || result.transcript === lastProcessed) {
      return;
    }

    const transcript = result.transcript;
    setLastProcessed(transcript);

    // Try to parse temperature
    const temp = parseSpokenNumber(transcript);
    if (temp !== null) {
      setParsedValue(temp);
      if (onTemperature) {
        onTemperature(temp);
      }
      // Auto-stop after successful temperature recognition
      setTimeout(() => {
        stopListening();
        setParsedValue(null);
      }, 1500);
      return;
    }

    // Try to detect command
    const command = detectCommand(transcript);
    if (command) {
      setDetectedCommand(command);
      if (onCommand) {
        onCommand(command);
      }
      // Auto-stop after successful command recognition
      setTimeout(() => {
        stopListening();
        setDetectedCommand(null);
      }, 1500);
    }
  }, [lastProcessed, onTemperature, onCommand]);

  const handleError = useCallback((error: string) => {
    console.error('Voice input error:', error);
  }, []);

  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput(handleResult, handleError);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setParsedValue(null);
      setDetectedCommand(null);
      setLastProcessed('');
      startListening();
    }
  };

  // Auto-stop after 10 seconds of listening
  useEffect(() => {
    if (isListening) {
      const timeout = setTimeout(() => {
        stopListening();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isListening, stopListening]);

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Voice input is not supported in this browser.
            <br />
            Try Chrome, Edge, or Safari.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-2', isListening && 'border-red-500', className)}>
      <CardContent className="p-4 space-y-4">
        {/* Voice Input Button */}
        <Button
          onClick={toggleListening}
          disabled={disabled}
          className={cn(
            'w-full h-16 text-lg font-semibold transition-all',
            isListening && 'bg-red-600 hover:bg-red-700 animate-pulse'
          )}
          size="lg"
        >
          {isListening ? (
            <>
              <MicOff className="h-6 w-6 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-6 w-6 mr-2" />
              🎤 Voice Input
            </>
          )}
        </Button>

        {/* Status Display */}
        {isListening && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-red-600 animate-pulse" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                Listening...
              </span>
            </div>
            
            {transcript && (
              <div className="text-sm text-muted-foreground mt-2">
                Heard: "{transcript}"
              </div>
            )}
            
            {parsedValue !== null && (
              <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                ✓ Temperature: {parsedValue}°C
              </div>
            )}
            
            {detectedCommand && (
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                ✓ Command: {detectedCommand.replace('-', ' ')}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Help Text */}
        {!isListening && !error && (
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Say temperature:</strong> "One hundred ninety two"
              <br />
              <strong>Or command:</strong> "First crack" / "Second crack"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
