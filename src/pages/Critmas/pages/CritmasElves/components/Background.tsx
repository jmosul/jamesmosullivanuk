import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import {Link} from 'react-router-dom';
import elvesGroup from 'assets/images/critmas/elves/elves.jpg';

function Background() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="6. Description/Background"/>
                </Col>
            </Row>
            <Row>
                <Col className="text-center" lg="3">
                    <img src={elvesGroup} alt="Elves!" width="100%" />
                </Col>
                <Col>
                    <p>
                        This is where you get to create <strong>who</strong> your elf is.  Remember to go christmassy, see <Link to="/critmas#YourElf">Role-playing Santa's Elves</Link> for ideas.
                    </p>

                    <p>
                        Since all our lovely elves have their Christmassy backgrounds, the ones offered here don't really work.
                        But they do offer some features and skills so pick one that suits your elf the best.
                    </p>

                    <p>
                        Then go wild, this is where I would like to see everything about your elf.
                    </p>
                    <p>
                       Give your elf a description and personality. It can just be handful of bullet points.  This is to help your role-playing, but it does also help your DM have an idea of what you're going for and lets me help you lean into that during the game.
                    </p>
                    <p>
                        There are some generation options here to give your elf some Bonds, Ideals, flaws.  You should definitely fill each of these, but the ones shown are only ideas, you can use them or set your own.
                    </p>
                </Col>


            </Row>
        </Container>
    );
}

export default Background;
