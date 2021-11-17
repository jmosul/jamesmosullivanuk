import React from 'react';

import imgElfMore from 'assets/images/critmas/elves/oldf.webp';
import {Card, CardImg} from 'react-bootstrap';

function ElfMore() {
    return (
        <Card>
            <CardImg src={imgElfMore} alt="Hmmm Co-co"/>
            <Card.Body>
                <Card.Title>And many more...</Card.Title>
                <p>You don't need to go with any of these suggestions, elves are diverse and everyone is different.</p>
                <p>Maybe you run the charming gingerbread cafe, or a grunge bar. Maybe you're just leaving Elf University ready to face the world? </p>

                <p>Oh jeez, with all the wonders of Grotto you might just be a BIG FAN of those amazing Toy Makers and it's your dream to meet them.</p>

                <p>Ah heck, get those whipper snappers away, you're one day from retirement!</p>
            </Card.Body>
        </Card>
    );
}

export default ElfMore;