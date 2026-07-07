const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The 5 exercises:
const exercises = [
  { id: 'cat-cow', title: 'CAT & COW', p: 'Gently arch your back up like a cat, then let your stomach drop down like a cow.' },
  { id: 'childs-pose', title: "CHILD'S POSE", p: 'Sit back on your heels, walk your hands forward, resting your forehead on the floor.' },
  { id: 'thread-needle', title: 'THREAD THE NEEDLE', p: 'Slide one arm under your body, resting your shoulder and head on the floor.' },
  { id: 'bird-dog', title: 'BIRD-DOG', p: 'Extend one arm forward and opposite leg backward. Keep back flat.' },
  { id: 'sphinx-pose', title: 'SPHINX POSE', p: 'Lie flat, prop yourself up on forearms, lifting chest to create a mild lower back arch.' }
];

for (const ex of exercises) {
  // We need to replace the block starting with `<div class="exercise-info">` up to `</div>\n        </div>`
  const regex = new RegExp(
    `<div class="exercise-info">\\s*` +
    `<h3>${ex.title.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&')}</h3>\\s*` +
    `<p>${ex.p.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&')}</p>\\s*` +
    `<div class="exercise-dose">\\s*` +
    `<div class="dose-group" data-type="sets">\\s*` +
    `<button class="progressive-toggle-btn" type="button" data-type="sets">SETS</button>\\s*` +
    `<button class="exercise-step-btn" type="button" data-field="sets" data-dir="-1">−</button>\\s*` +
    `<strong data-value="sets">(\\d+)</strong>\\s*` +
    `<button class="exercise-step-btn" type="button" data-field="sets" data-dir="1">\\+</button>\\s*` +
    `</div>\\s*` +
    `<div class="dose-group" data-type="reps">\\s*` +
    `<button class="progressive-toggle-btn" type="button" data-type="reps">REPS</button>\\s*` +
    `<button class="exercise-step-btn" type="button" data-field="reps" data-dir="-1">−</button>\\s*` +
    `<strong data-value="reps">(\\d+)</strong>\\s*` +
    `<button class="exercise-step-btn" type="button" data-field="reps" data-dir="1">\\+</button>\\s*` +
    `</div>\\s*` +
    `</div>\\s*` +
    `</div>`,
    'g'
  );

  html = html.replace(regex, (match, sets, reps) => {
    return `<div class="exercise-copy">
          <h2>${ex.title}</h2>
          <p>${ex.p}</p>
          <div class="exercise-dosage">
            <div class="exercise-dose" data-type="sets">
              <button class="progressive-toggle-btn" type="button" data-type="sets">SETS</button>
              <button class="exercise-step-btn" type="button" data-field="sets" data-dir="-1">−</button>
              <strong data-value="sets">${sets}</strong>
              <button class="exercise-step-btn" type="button" data-field="sets" data-dir="1">+</button>
            </div>
            <div class="exercise-dose" data-type="reps">
              <button class="progressive-toggle-btn" type="button" data-type="reps">REPS</button>
              <button class="exercise-step-btn" type="button" data-field="reps" data-dir="-1">−</button>
              <strong data-value="reps">${reps}</strong>
              <button class="exercise-step-btn" type="button" data-field="reps" data-dir="1">+</button>
            </div>
          </div>
        </div>`;
  });
}

fs.writeFileSync('index.html', html);
console.log('Fixed HTML layout for new exercises');
