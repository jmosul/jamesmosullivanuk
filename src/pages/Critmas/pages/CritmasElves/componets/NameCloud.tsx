import React from 'react';
import ReactWordcloud from 'react-wordcloud';

function NameCloud() {
    const names = [
        'Buddy Partysledge',
        'Tinsel Plumwrap',
        'Cookie Morningkiss',
        'Trixie Grottocarol',
        'Starlight Puddinggame',
        'Snowflake Puddingicicle',
        'Brandy Picklemitten',
        'Twinkle Hollyhug',
        'Caramel Jinglebottom',
        'Fuzzle Twinklebeard',
        'Mistletoe Fireguest',
        'Jolly Hollynight',
        'Ginger Hustleplum',
    ];

    const words = names.map((text) => {
        let value = Math.floor(Math.random() * 10)

        value = value === 0 ? 1 : value;

        return {text, value};
    }).sort((a, b) => a.value - b.value);

    return (
        <div>
            <ReactWordcloud words={words} />
        </div>
    );
}

export default NameCloud;
