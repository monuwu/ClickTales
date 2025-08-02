import React from 'react';

const compliments = [
  "You look amazing!",
  "That smile could end wars!",
  "You're glowing!",
  "This shot belongs in a magazine!",
  "Wow! Someone call Vogue!",
  "You’re the real main character today.",
  "Cuteness overload detected.",
  "You + Camera = Magic 💫",
  "That's a legendary click!",
  "This one’s going in the highlight reel!"
];

const Compliment = () => {
  const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
  return (
    <p style={{ fontStyle: 'italic', color: '#ff4081', fontWeight: 'bold' }}>
      💬 {randomCompliment}
    </p>
  );
};

export default Compliment;
