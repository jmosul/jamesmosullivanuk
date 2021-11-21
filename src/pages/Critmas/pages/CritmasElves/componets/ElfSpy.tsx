import React from 'react';

import imgElfSpy from 'assets/images/critmas/elves/oldm.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfSpy() {
    return (
        <Card>
            <CardImg src={imgElfSpy} alt="Information gatherer"/>
            <Card.Body>
                <Card.Title>MI6 Agent</Card.Title>

                <p>Mistletoe Intelligence Service 6.</p>
                <p>
                    Have you seen how many children there are? Billions.  And Santa needs to keep track of all them.  Which of them are naughty and which of them are nice.  And also, just what sort of toys are they into these days?
                </p>
              
                <p>Santa's agents are placed everywhere from large department stores to posts in child care. They work hard to keep up appearences, but they're also reporting back to North Pole HQ.

                <p>Has the world changed you? Is it too big?  Or is it wonderful to be out there?  And, just why are you back at the North Pole and not at your post?</p>
            </Card.Body>
        </Card>
    );
}

export default ElfSpy;
