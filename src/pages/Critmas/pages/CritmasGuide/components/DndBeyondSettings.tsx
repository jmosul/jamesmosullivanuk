import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import sourceSettings from 'assets/images/critmas/dndbeyond/source_settings.png';

function DndBeyondSettings() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="2. Settings" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5>Character name</h5>
                    <p>
                        The first thing dndbeyond will ask for is your character's name. Remember to think of a fun christmassy name.
                        <br/> If you're not sure on a name yet, don't worry you can come back and fill this in later.
                    </p>

                    <p>
                        <strong>Choose</strong> a profile picture.  You can do this later too, but you will need a profile picture so we can distinguish your character from others.
                        <br />Since D&D is all Tolkien-esque elves, I recommend uploading a custom avatar.
                    </p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <h5 className="mt-2">Character Preferences</h5>
                    <p>
                        The most important part of this first page is these admin (boo!) settings.
                        But don't worry, there's only a couple to set.
                    </p>

                    <p>
                        Just make sure the only <strong>"Source"</strong> you have turned on is "Homebrew content".
                        <br/>See the screenshot to compare.
                    </p>
                </Col>
                <Col lg="4" className="text-center">
                    <img src={sourceSettings} alt="Source settings example" width="300"/>
                </Col>
            </Row>
            <Row>
                <Col>
                    The rest should stay as the defaults, except from the last two which are entirely up to you.
                </Col>
            </Row>
        </Container>
    );
}

export default DndBeyondSettings;
