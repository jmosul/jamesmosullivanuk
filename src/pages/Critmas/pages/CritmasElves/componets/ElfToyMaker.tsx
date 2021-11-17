import React from 'react';

import imgElfToyMaker from 'assets/images/critmas/elves/toymaker.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfToyMaker() {
    return (
        <Card>
            <CardImg src={imgElfToyMaker} alt="toy maker"/>
            <Card.Body>
                <Card.Title>Toy Maker</Card.Title>
                <p>The biggest industry in all of Christmas Town, and the most prestigious. You are the ones that bring joy to children every year. It's your toys that Santa delivers to the good girls and boys.</p>
                <p>The toy makers are the celebrities of the North Pole, idolised by many who grow up with dreams of joining the Toy Makers</p>

                <p>Are you a young spark looking to make their name? Or maybe an old timer who thinks toys where better when they were made out of wood and contained choking hazards?</p>
            </Card.Body>
        </Card>
    );
}

export default ElfToyMaker;