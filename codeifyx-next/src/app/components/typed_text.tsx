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

  return <span ref={el}></span>;
}