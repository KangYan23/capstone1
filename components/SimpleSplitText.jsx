import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const SimpleSplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 0.8,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = 'center',
  tag = 'p',
  onAnimationComplete
}) => {
  const ref = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  // Manual text splitting function
  const splitTextIntoElements = (text, type) => {
    if (type === 'chars') {
      return text.split('').map((char, i) => ({
        content: char === ' ' ? '\u00A0' : char,
        key: i
      }));
    } else if (type === 'words') {
      return text.split(' ').map((word, i) => ({
        content: word,
        key: i
      }));
    }
    return [{ content: text, key: 0 }];
  };

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      
      const elements = ref.current.querySelectorAll('.split-element');
      if (elements.length === 0) return;

      gsap.fromTo(
        elements,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: () => {
            onAnimationComplete?.();
          }
        }
      );
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        fontsLoaded,
        onAnimationComplete
      ],
      scope: ref
    }
  );

  const elements = splitTextIntoElements(text, splitType);

  const renderTag = () => {
    const style = {
      textAlign,
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'normal',
      wordWrap: 'break-word'
    };
    const classes = `split-parent ${className}`;

    const content = (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
        {elements.map((el) => (
          <span
            key={el.key}
            className="split-element"
            style={{ display: 'inline-block' }}
          >
            {el.content}
          </span>
        ))}
      </span>
    );

    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref} style={style} className={classes}>
            {content}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref} style={style} className={classes}>
            {content}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref} style={style} className={classes}>
            {content}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref} style={style} className={classes}>
            {content}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref} style={style} className={classes}>
            {content}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref} style={style} className={classes}>
            {content}
          </h6>
        );
      default:
        return (
          <p ref={ref} style={style} className={classes}>
            {content}
          </p>
        );
    }
  };
  
  return renderTag();
};

export default SimpleSplitText;
