import React from 'react';

import imgElfStable from 'assets/images/critmas/elves/young.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfStable() {
    return (
        <Card>
            <CardImg src={imgElfStable} alt="Stables"/>
            <Card.Body>
                <Card.Title>Reindeer Supervisor</Card.Title>
                <p>Those elves in the workshop may built the toys, but Santa wouldn't be able to get them to all the children of the world without Rudolph and Co.</p>
                <p>
                    And who makes sure those reindeer's are in tip top shape for their global circumnavigation?  Who feeds them?  Cares for them?  Who buffs that red nose?
                    <br/>Why you of course!
                </p>

                <p>Some might hate shovelling the unspeakable leavings, but others understand that reindeers are better than people.</p>
            </Card.Body>
        </Card>
    );
}

export default ElfStable;