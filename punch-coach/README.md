# StrikeLab Camera Boxing Coach

A privacy-first, browser-based boxing movement analyzer. It uses MediaPipe Pose to recognize punch motion and score technique, camera-estimated wrist speed, a relative power index, guard, stance, rotation, and exhale timing.

## Important limitation

The power index is a relative coaching score. A monocular camera cannot measure true impact force, effective striking mass, contact quality, or injury risk. This tool complements—not replaces—a qualified boxing coach.

## Run

Open `index.html` through HTTPS (GitHub Pages works). Allow camera and microphone access, position the full body in frame, enter shoulder width for scale calibration, select stance, and begin.

## Research references

- Dinu et al. (2020), *Biomechanical Analysis of the Cross, Hook, and Uppercut in Junior vs. Elite Boxers*: https://pmc.ncbi.nlm.nih.gov/articles/PMC7739747/
- Liu et al. (2022), *Biomechanics of the lead straight punch of different level boxers*: https://pmc.ncbi.nlm.nih.gov/articles/PMC9798280/
- Ishac & Eager (2021), *Evaluating Martial Arts Punching Kinematics Using a Vision and Inertial Sensing System*: https://pmc.ncbi.nlm.nih.gov/articles/PMC8001023/
