'use client';

import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

export default function TypedText() {
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['Streamline Coding', 'Ease Debugging', 'Enhance Productivity', 'Document Functions', 'Format Code', 'Refine Logic', 'Correct Syntax'],
      typeSpeed: 70,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
      showCursor: false,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="h-[1.5em] flex items-center justify-center">
      <span ref={el} className="text-6xl font-bold bg-gradient-to-br from-[#e69f57] via-[#e0727a] to-[#bd3fb1] text-transparent bg-clip-text"></span>
    </div>
  );
}