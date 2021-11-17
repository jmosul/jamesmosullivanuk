import React from 'react';

import imgLumberJack from 'assets/images/critmas/elves/lumber.webp';
import {Card, CardImg} from 'react-bootstrap';

function LumberJack() {
    return (
        <Card>
            <CardImg src={imgLumberJack} alt="Lumber crew"/>
            <Card.Body>
                <Card.Title>Lumber Crew</Card.Title>
                <p>Phew. That's a lot of toys! Where do you think all the material for comes from? Wood doesn't grow on trees you know!</p>
                <p>Actually it does!  And that's where you come in, burly outdoorsy elves risking a squashed jingle bell in the Lumber Crew to make sure those toy makers don't run out.</p>

                <p>Ah the great out doors in that brisk weather. Do you know the Lumber Crew also has a crack Caber Toss team too?!</p>
            </Card.Body>
        </Card>
    );
}

export default LumberJack;