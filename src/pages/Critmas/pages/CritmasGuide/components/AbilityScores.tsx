import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import abilityScoresExample from 'assets/images/critmas/dndbeyond/ability_scores.png';

function AbilityScores() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="5. Ability Scores"/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>
                        For this One-Shot we will be using the <strong>Manual/Rolled</strong> generation method.
                    </p>

                    <p>
                        On selecting this you will be shown "Dice Roll Groups". It will let you roll six ability scores that you can then assign to each ability in any order you choose.
                    </p>

                    <p>
                        You can create two "Dice Roll Groups" and choose the one you prefer. Effectively this means you get to re-roll the ability scores once.
                    </p>
                </Col>
                <Col className="text-center" lg="8">
                    <img src={abilityScoresExample} alt="Ability Scores Example" width="100%"/>
                </Col>
            </Row>
        </Container>
    );
}

export default AbilityScores;
