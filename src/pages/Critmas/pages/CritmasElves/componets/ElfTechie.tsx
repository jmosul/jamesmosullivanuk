import React from 'react';

import imgElfTechie from 'assets/images/critmas/elves/stable.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfTechie() {
    return (
        <Card>
            <CardImg src={imgElfTechie} alt="Techie"/>
            <Card.Body>
                <Card.Title>The Caretakers</Card.Title>
                <p>Flying sleighs, stables, elf homes and a toy workshop? Phew, the North Pole is complex place that needs to keep moving all year to deliver Christmas.</p>
                <p>Luckily there's a crack team of Techies, Mechanics, carpenters and the like.  Who else is going to turn the Toy Wrapper 2000 on and off again?</p>

                <p>Pft, look at those idiot End Users, am I right? Who are we kidding?  Complex problems to solve, people to help, clockwork machines to tune; what a great way to spend your time!</p>
            </Card.Body>
        </Card>
    );
}

export default ElfTechie;