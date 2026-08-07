# NOEMA Voice Architecture v0.9

Voice is optional and browser-controlled.

## Read aloud

Uses `speechSynthesis`.

The user may choose:
- device voice;
- speaking rate;
- pitch.

Only the preference is stored locally.

## Push to talk

Speech recognition:
- begins only after an explicit button press;
- uses `continuous = false`;
- never runs as ambient/background listening;
- does not store microphone audio;
- does not auto-send recognized text.

The transcript is inserted into the message composer for user review.

## No recording

v0.9 does not provide an audio recorder.

Professional sound creation remains a separate future specialist workflow.
