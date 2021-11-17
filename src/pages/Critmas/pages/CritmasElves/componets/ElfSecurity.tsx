import React from 'react';

import imgElf from 'assets/images/critmas/elves/security.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfSecurity() {
    return (
        <Card>
            <CardImg src={imgElf} alt="Security"/>
            <Card.Body>
                <Card.Title>North Pole Security</Card.Title>

                <p>Sure Christmas Town is a sweet place; full of wonder and ginger bread houses. Even the lollipop ladies brandish real giant lollipops.</p>
                <p>
                    The borders of the town are another matter. It's an unforgiving icy wasteland out there and you know when the next nosy human is going to come looking.
                    Or when a vicious polar bear might he out hunting.
                    It's your job to keep the town safe, can't have Christmas if all the elves are dead now can we?
                </p>

                <p>Are you an action seeker, or a gruff elf who has seen it all?</p>
            </Card.Body>
        </Card>
    );
}

export default ElfSecurity;