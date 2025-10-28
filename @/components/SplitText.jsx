import { useRef, useEffect, useState } from 'react';import { useRef, useEffect, useState } from 'react';import { useRef, useEffect, useState } from 'react';

import { gsap } from 'gsap';

import { useGSAP } from '@gsap/react';import { gsap } from 'gsap';import { gsap } from 'gsap';



gsap.registerPlugin(useGSAP);import { useGSAP } from '@gsap/react';import { useGSAP } from '@gsap/react';



const SplitText = ({

  text,

  className = '',gsap.registerPlugin(useGSAP);gsap.registerPlugin(useGSAP);

  delay = 100,

  duration = 0.6,

  ease = 'power3.out',

  splitType = 'chars',const SplitText = ({const SplitText = ({

  from = { opacity: 0, y: 40 },

  to = { opacity: 1, y: 0 },  text,  text,

  textAlign = 'center',

  tag = 'p',  className = '',  className = '',

  onLetterAnimationComplete

}) => {  delay = 100,  delay = 100,

  const ref = useRef(null);

  const [fontsLoaded, setFontsLoaded] = useState(false);  duration = 0.6,  duration = 0.6,



  useEffect(() => {  ease = 'power3.out',  ease = 'power3.out',

    if (document.fonts.status === 'loaded') {

      setFontsLoaded(true);  splitType = 'chars',  splitType = 'chars',

    } else {

      document.fonts.ready.then(() => {  from = { opacity: 0, y: 40 },  from = { opacity: 0, y: 40 },

        setFontsLoaded(true);

      });  to = { opacity: 1, y: 0 },  to = { opacity: 1, y: 0 },

    }

  }, []);  textAlign = 'center',  textAlign = 'center',



  const splitTextIntoElements = (text, type) => {  tag = 'p',  tag = 'p',

    if (type === 'chars') {

      return text.split('').map((char, i) => ({  onLetterAnimationComplete  onLetterAnimationComplete

        content: char === ' ' ? '\u00A0' : char,

        key: i}) => {}) => {

      }));

    } else if (type === 'words') {  const ref = useRef(null);  const ref = useRef(null);

      return text.split(' ').map((word, i) => ({

        content: word,  const [fontsLoaded, setFontsLoaded] = useState(false);  const [fontsLoaded, setFontsLoaded] = useState(false);

        key: i

      }));

    }

    return [{ content: text, key: 0 }];  useEffect(() => {  useEffect(() => {

  };

    if (document.fonts.status === 'loaded') {    if (document.fonts.status === 'loaded') {

  useGSAP(

    () => {      setFontsLoaded(true);      setFontsLoaded(true);

      if (!ref.current || !text || !fontsLoaded) return;

          } else {    } else {

      const elements = ref.current.querySelectorAll('.split-element');

      if (elements.length === 0) return;      document.fonts.ready.then(() => {      document.fonts.ready.then(() => {



      gsap.fromTo(        setFontsLoaded(true);        setFontsLoaded(true);

        elements,

        { ...from },      });      });

        {

          ...to,    }    }

          duration,

          ease,  }, []);  }, []);

          stagger: delay / 1000,

          onComplete: () => {

            onLetterAnimationComplete?.();

          }  // Manual text splitting function  // Manual text splitting function

        }

      );  const splitTextIntoElements = (text, type) => {  const splitTextIntoElements = (text, type) => {

    },

    {    if (type === 'chars') {    if (type === 'chars') {

      dependencies: [

        text,      return text.split('').map((char, i) => ({      return text.split('').map((char, i) => ({

        delay,

        duration,        content: char === ' ' ? '\u00A0' : char,        content: char === ' ' ? '\u00A0' : char,

        ease,

        splitType,        key: i        key: i

        JSON.stringify(from),

        JSON.stringify(to),      }));      }));

        fontsLoaded,

        onLetterAnimationComplete    } else if (type === 'words') {    } else if (type === 'words') {

      ],

      scope: ref      return text.split(' ').map((word, i) => ({      return text.split(' ').map((word, i) => ({

    }

  );        content: word,        content: word,



  const elements = splitTextIntoElements(text, splitType);        key: i        key: i



  const renderTag = () => {      }));      }));

    const style = {

      textAlign,    }    }

      overflow: 'hidden',

      display: 'inline-block',    return [{ content: text, key: 0 }];    return [{ content: text, key: 0 }];

      whiteSpace: 'normal',

      wordWrap: 'break-word'  };  };

    };

    const classes = `split-parent ${className}`;



    const content = (  useGSAP(  useGSAP(

      <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>

        {elements.map((el) => (    () => {    () => {

          <span

            key={el.key}      if (!ref.current || !text || !fontsLoaded) return;      if (!ref.current || !text || !fontsLoaded) return;

            className="split-element"

            style={{ display: 'inline-block' }}            

          >

            {el.content}      const elements = ref.current.querySelectorAll('.split-element');      const elements = ref.current.querySelectorAll('.split-element');

          </span>

        ))}      if (elements.length === 0) return;      if (elements.length === 0) return;

      </span>

    );



    switch (tag) {      gsap.fromTo(      gsap.fromTo(

      case 'h1':

        return (        elements,        elements,

          <h1 ref={ref} style={style} className={classes}>

            {content}        { ...from },        { ...from },

          </h1>

        );        {        {

      case 'h2':

        return (          ...to,          ...to,

          <h2 ref={ref} style={style} className={classes}>

            {content}          duration,          duration,

          </h2>

        );          ease,          ease,

      case 'h3':

        return (          stagger: delay / 1000,          stagger: delay / 1000,

          <h3 ref={ref} style={style} className={classes}>

            {content}          onComplete: () => {          onComplete: () => {

          </h3>

        );            onLetterAnimationComplete?.();            onLetterAnimationComplete?.();

      case 'h4':

        return (          }          }

          <h4 ref={ref} style={style} className={classes}>

            {content}        }        }

          </h4>

        );      );      );

      case 'h5':

        return (    },    },

          <h5 ref={ref} style={style} className={classes}>

            {content}    {    {

          </h5>

        );      dependencies: [      dependencies: [

      case 'h6':

        return (        text,        text,

          <h6 ref={ref} style={style} className={classes}>

            {content}        delay,        delay,

          </h6>

        );        duration,        duration,

      default:

        return (        ease,        ease,

          <p ref={ref} style={style} className={classes}>

            {content}        splitType,        splitType,

          </p>

        );        JSON.stringify(from),        JSON.stringify(from),

    }

  };        JSON.stringify(to),        JSON.stringify(to),

  

  return renderTag();        fontsLoaded,        fontsLoaded,

};

        onLetterAnimationComplete        onLetterAnimationComplete

export default SplitText;

      ],      ],

      scope: ref      scope: ref

    }    }

  );  );



  const elements = splitTextIntoElements(text, splitType);  const elements = splitTextIntoElements(text, splitType);



  const renderTag = () => {  const renderTag = () => {

    const style = {    const style = {

      textAlign,      textAlign,

      overflow: 'hidden',      overflow: 'hidden',

      display: 'inline-block',      display: 'inline-block',

      whiteSpace: 'normal',      whiteSpace: 'normal',

      wordWrap: 'break-word'      wordWrap: 'break-word'

    };    };

    const classes = `split-parent ${className}`;    const classes = `split-parent ${className}`;



    const content = (    const content = (

      <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>      <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>

        {elements.map((el) => (        {elements.map((el) => (

          <span          <span

            key={el.key}            key={el.key}

            className="split-element"            className="split-element"

            style={{ display: 'inline-block' }}            style={{ display: 'inline-block' }}

          >          >

            {el.content}            {el.content}

          </span>          </span>

        ))}        ))}

      </span>      </span>

    );    );



    switch (tag) {    switch (tag) {

      case 'h1':      case 'h1':

        return (        return (

          <h1 ref={ref} style={style} className={classes}>          <h1 ref={ref} style={style} className={classes}>

            {content}            {content}

          </h1>          </h1>

        );        );

      case 'h2':      case 'h2':

        return (        return (

          <h2 ref={ref} style={style} className={classes}>          <h2 ref={ref} style={style} className={classes}>

            {content}            {content}

          </h2>          </h2>

        );        );

      case 'h3':      case 'h3':

        return (        return (

          <h3 ref={ref} style={style} className={classes}>          <h3 ref={ref} style={style} className={classes}>

            {content}            {content}

          </h3>          </h3>

        );        );

      case 'h4':      case 'h4':

        return (        return (

          <h4 ref={ref} style={style} className={classes}>          <h4 ref={ref} style={style} className={classes}>

            {content}            {content}

          </h4>          </h4>

        );        );

      case 'h5':      case 'h5':

        return (        return (

          <h5 ref={ref} style={style} className={classes}>          <h5 ref={ref} style={style} className={classes}>

            {content}            {content}

          </h5>          </h5>

        );        );

      case 'h6':      case 'h6':

        return (        return (

          <h6 ref={ref} style={style} className={classes}>          <h6 ref={ref} style={style} className={classes}>

            {content}            {content}

          </h6>          </h6>

        );        );

      default:      default:

        return (        return (

          <p ref={ref} style={style} className={classes}>          <p ref={ref} style={style} className={classes}>

            {content}            {content}

          </p>          </p>

        );        );

    }    }

  };  };

    

  return renderTag();  return renderTag();

};};



export default SplitText;export default SplitText;

    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref} style={style} className={classes}>
            {text}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref} style={style} className={classes}>
            {text}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref} style={style} className={classes}>
            {text}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref} style={style} className={classes}>
            {text}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref} style={style} className={classes}>
            {text}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref} style={style} className={classes}>
            {text}
          </h6>
        );
      default:
        return (
          <p ref={ref} style={style} className={classes}>
            {text}
          </p>
        );
    }
  };
  return renderTag();
};

export default SplitText;
