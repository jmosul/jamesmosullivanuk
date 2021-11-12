import React from 'react';

export interface HeadingProps {
    level?: string;
    text: string;
}

const renderHeading = (level: string, text: string) => {
    switch(level) {
        case '1':
            return <h1 className="mt-2">{text}</h1>

        case '2':
            return <h2 className="mt-4">{text}</h2>

        case '3':
        default:
            return <h4 className="mt-4">{text}</h4>
    }
}

function Heading({level, text}: HeadingProps) {
    level = level || '3';

    return (
        <div>
            {renderHeading(level, text)}
            <hr/>
        </div>
    )
}

export default Heading;
