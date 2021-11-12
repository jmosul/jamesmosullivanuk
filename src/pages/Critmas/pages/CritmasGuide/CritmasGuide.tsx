import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import JoinBeyondCampaign from '../CritmasElves/components/JoinBeyondCampaign';
import DndBeyondSettings from '../CritmasElves/components/DndBeyondSettings';
import Heading from '../../../../componets/Heading';
import RaceSettings from '../CritmasElves/components/RaceSettings';
import PickAClass from '../CritmasElves/components/PickAClass';
import AbilityScores from '../CritmasElves/components/AbilityScores';
import Background from '../CritmasElves/components/Background';
import Equipment from '../CritmasElves/components/Equipment';
import Done from '../CritmasElves/components/Done';
import LastBits from '../CritmasElves/components/LastBits';

function CritmasGuide() {
    const dndBeyondJoinId = 24507462718679604;
    const campaignName = 'The Night Before Critmas';

    return (
        <div>
            <Container as="main" className="bg-light">
                <Row>
                    <Col>
                        <Heading text="How to Create Your Elf" level="2" />
                        <p>
                            This guide will help you set up your elf, just have it open alongside DndBeyond as you create your character.
                        </p>

                        <p>
                           Even if you have use dndbeyond before this guide will include some settings you will need to know.
                        </p>
                    </Col>
                </Row>
            </Container>

            <JoinBeyondCampaign joinId={dndBeyondJoinId} campaignName={campaignName} />
            <DndBeyondSettings />
            <RaceSettings />
            <PickAClass />
            <AbilityScores />
            <Background />
            <Equipment />
            <LastBits />
            <Done />
        </div>
    );
}

export default CritmasGuide;