import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  makeStyles,
  Label,
  Input,
  Field,
} from "@fluentui/react-components";
import axios from "axios";
import PropTypes from 'prop-types';
import { DatePicker } from "@fluentui/react";

const useStyles = makeStyles({
    content: {
      display: "flex",
      flexDirection: "column",
      rowGap: "10px",
    },
  })

/**
 * Dialog for creating goods
 * @param {{onClose: () => void; open: boolean}} props 
 * @returns 
 */
export const SessionCreationDialog = (props) => {
    const styles = useStyles();

    const handleSubmitGoodForm = (event) => {
        event.preventDefault();
        //const form = event.target;
        var good = {
            name: event.target.nom.value,
            description: event.target.description.value,
            count: Number(event.target.number.value),
            purchaseValue: Number(event.target.achat.value),
          }
          
        axios.post('/api/sessions', good)
            .then(function (response) {
                console.log(response.state);
                console.log(response.data);
                props.onClose?.();
            })
            .catch(e => {
                console.error(e);
            });
    }

  return (
    <Dialog open={props.open}>
      <DialogSurface>
      <form onSubmit={handleSubmitGoodForm}>
          <DialogBody>
            <DialogTitle>Créer une session </DialogTitle>
            <DialogContent className={styles.content}>
                <Field label="Select a date">
                    <DatePicker 
                        placeholder="Select a date..."
                    />
                </Field>
                <Label required htmlFor={"Description"}>Description</Label>
                <Input required type="Description" name="description" id={"Description-input"} />
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => props?.onClose?.()}>Close</Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                Submit
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};

SessionCreationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}