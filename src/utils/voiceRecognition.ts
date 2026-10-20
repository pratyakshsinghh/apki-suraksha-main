// Voice Command SOS recognizer using Web Speech API
type VoiceTriggerCallback = (detectedPhrase: string) => void;
type TranscriptCallback = (transcript: string) => void;

class VoiceRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onTriggerCallback: VoiceTriggerCallback | null = null;
  private onTranscriptCallback: TranscriptCallback | null = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const resultsLength = event.results.length;
          const currentResult = event.results[resultsLength - 1];
          const transcript = currentResult[0].transcript.toLowerCase().trim();

          if (this.onTranscriptCallback) {
            this.onTranscriptCallback(transcript);
          }

          // Trigger phrases - specifically including user's requested phrase
          const triggerPhrases = [
            'please start sos alert',
            'please start the sos alert',
            'start sos alert',
            'please start sos',
            'start sos',
            'turn on the sos alert',
            'turn on sos alert',
            'turn on sos',
            'activate sos alert',
            'activate sos',
            'help me',
            'save me',
            'emergency',
            'danger',
          ];

          // Check if transcript contains any trigger phrase
          for (const phrase of triggerPhrases) {
            if (transcript.includes(phrase)) {
              if (this.onTriggerCallback) {
                this.onTriggerCallback(transcript);
              }
              break;
            }
          }
        };

        this.recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            console.warn('Speech recognition status:', e.error);
          }
        };

        this.recognition.onend = () => {
          // Auto restart if intended to be listening
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch {
              // Ignore restart collision
            }
          }
        };
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(onTrigger: VoiceTriggerCallback, onTranscript?: TranscriptCallback) {
    if (!this.recognition) return false;
    this.onTriggerCallback = onTrigger;
    if (onTranscript) {
      this.onTranscriptCallback = onTranscript;
    }
    this.isListening = true;
    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();
