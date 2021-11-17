import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';

export interface JoinParams {
    campaignName: string,
    joinId: number;
}

function JoinBeyondCampaign(props: JoinParams) {
    const joinLink = `https://ddb.ac/campaigns/join/${props.joinId}`;

    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="1. Join Campaign" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>
                        To create a character you will first need to sign up to&nbsp;
                        <a href="https://dndbeyond.com"
                           title="Dndbeyond.com"
                           target="_blank"
                        >dndbeyond.com</a>.
                    </p>

                    <p>
                        If you have not used dndbeyond before, it is an online tool for creating and playing D&D characters.
                        Its wizard will help guide you in creating your character, help you manage stats, skills and spells.
                        It will even roll dice for you during the game!
                    </p>

                    <p>
                        Once you've signed up use the join button to get started.
                    </p>
                    <p>
                        Follow this guide as you go and we'll soon have your Christmas Elf ready to go!
                    </p>
                </Col>
                <Col className="text-center">
                    <a
                        href={joinLink}
                        className="btn btn-primary btn-lg m-4"
                        title={'Join' + props.campaignName}
                        target="_blank"
                    >
                        Join {props.campaignName}
                        <br/>on D&D Beyond
                    </a>
                </Col>
            </Row>
        </Container>
    );
}

export default JoinBeyondCampaign;
