import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import candySword from 'assets/images/critmas/elves/candy_sword.webp';

function Background() {
    return (
        <Container as="section" className="bg-light text-center">
            <Row>
                <Col>
                    <Heading text="And we're done!"/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>
                        And that's your character ready to go!  Aren't they amazing?
                        <small>
                            <br />No? Well, feel free to keep changing right up to the game starts.
                        </small>
                    </p>

                    <p>
                        Let me know you've created your character, I might have questions :)
                    </p>

                    <p>
                        And now all we have to do it is wait for the fun to begin!
                    </p>

                    <p>
                        <img
                            src="https://64.media.tumblr.com/2fe03a2e6bfd29ed67594899f4ad4bd7/tumblr_mfggkfOMsX1rl07gno1_500.gif"
                            alt="Exciting!"
                            height="200px"
                        />
                    </p>

                    <p>
                        <strong>Oh! One final thing!</strong>
                    </p>
                    <p>
                        <a href="https://app.roll20.net/join/11848685/hz6tAg"
                           title="Join Roll20 Campaign"
                           className="btn btn-primary btn-lg"
                           >Join on Roll20</a>
                    </p>
                    <p>
                        <small>For new people, we use Roll20 for maps when in combat.  It will allow you to control your character when we play.</small>
                    </p>
                </Col>
            </Row>
        </Container>
    );
}

export default Background;
