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
  Label,
  Input,
  makeStyles,
} from "@fluentui/react-components";
import axios from "axios";
import PropTypes from 'prop-types';

const useStyles = makeStyles({
    content: {
      display: "flex",
      flexDirection: "column",
      rowGap: "10px",
    },
  })

/**
 * Dialog forr creating goods
 * @param {{onClose: () => void; open: boolean}} props 
 * @returns 
 */
export const GoodCreationDialog = (props) => {
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
          
        axios.post('/api/goods', good)
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
            <DialogTitle>Créer un bien </DialogTitle>
            <DialogContent className={styles.content}>
              <Label required htmlFor={"nom"}>
                Nom
              </Label>
              <Input required type="nom" name="nom" id={"nom-input"} />
              <Label required htmlFor={"Description"}>
                Description
              </Label>
              <Input required type="Description" name="description" id={"Description-input"} />
              <Label required htmlFor={"Quantite"}>
                Quantite
              </Label>
              <Input required type="nombre" name="number" id={"Quantite-input"} />
              <Label required htmlFor={"purchaseValue"}>
               Valeur achat
              </Label>
              <Input required type="number" name="achat" id={"purchaseValue-input"} />
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

GoodCreationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}