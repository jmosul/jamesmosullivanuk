import React from 'react';

import imgElfTechie from 'assets/images/critmas/elves/stable.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfTechie() {
    return (
        <Card>
            <CardImg src={imgElfTechie} alt="Techie"/>
            <Card.Body>
                <Card.Title>The Caretakers</Card.Title>
                <p>Flying sleighs, stables, elf homes and toy workshop? Phew, the North Pole is complex place that needs to keep moving all year to deliver Christmas.</p>
                <p>Luckily there's a crack team of Techies, Mechanics, carpenters and a the like.  Who else is going to turn Toy Wrapper 2000 on and off again?</p>

                <p>Pft, End users right? Who are we kidding, problems to solve, people to help what a great way to spend your time!</p>
            </Card.Body>
        </Card>
    );
}

export default ElfTechie;