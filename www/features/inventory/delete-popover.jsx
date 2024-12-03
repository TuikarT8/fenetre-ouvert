import React from 'react'
import {
    Delete24Regular,
} from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import { Button, Popover, PopoverSurface, PopoverTrigger, Title3} from '@fluentui/react-components';

export function PreviousSessionGoodDeleteConfirmationPopover() {
    return (
        <Popover withArrow>
            <PopoverTrigger disableButtonEnhancement>
                <Button icon={<Delete24Regular />} aria-label="Delete" />
            </PopoverTrigger>

            <PopoverSurface tabIndex={-1}>
                <Content content={'Voulez-vous vraiment supprimer le bien'} />
            </PopoverSurface>
        </Popover>
    )
}


function Content({content,  onClose}) {
    return (
        <div>     
            <Title3>{content}</Title3>
                <Button appearance="secondary" onClick={() => onClose?.(false)}>
                    Annuler
                </Button>
                <Button
                    appearance="primary"
                    onClick={() => onClose?.(true)}>
                    Confirmer
                </Button>
        </div>
    )
}


Content.propTypes = {
    open: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
}