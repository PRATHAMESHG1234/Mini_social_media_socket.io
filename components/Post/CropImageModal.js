import React, { useEffect, useState } from "react";
import { Cropper } from "react-cropper";
import { Button, Grid, Header, Icon, Modal } from "semantic-ui-react";

const CropImageModal = ({
  mediaPreview,
  setMedia,
  showModal,
  setShowModal,
  setMediaPreview,
}) => {
  const [cropper, setCropper] = useState(null);

  const getCropData = () => {
    if (cropper) {
      const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
      setMedia(croppedDataUrl);
      setMediaPreview(croppedDataUrl);
      cropper.destroy(); // Clean up the Cropper instance
    }

    setShowModal(false);
  };

  useEffect(() => {
    const handleKeyDown = ({ key }) => {
      if (cropper) {
        if (key === "m") {
          cropper.setDragMode("move");
        }
        if (key === "c") {
          cropper.setDragMode("crop");
        }
        if (key === "r") {
          cropper.clear(); // Reset the crop area
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cropper]);

  return (
    <Modal
      closeOnDimmerClick={false}
      size="large"
      onClose={() => setShowModal(false)}
      open={showModal}
    >
      <Modal.Header>Crop image before upload</Modal.Header>

      <Grid columns={2}>
        <Grid.Column>
          <Modal.Content image>
            <Cropper
              style={{ height: "400px", width: "100%" }}
              aspectRatio={1}
              preview=".img_preview"
              src={mediaPreview}
              dragMode="move"
              guides={true}
              zoomable={true}
              viewMode={1}
              minCropBoxHeight={10}
              minContainerWidth={10}
              background={false}
              autoCropArea={1}
              checkOrientation={false}
              onInitialized={(cropper) => setCropper(cropper)}
            />
          </Modal.Content>
        </Grid.Column>
        <Grid.Column>
          <Modal.Content image>
            <div>
              <Header as="h2">
                <Icon name="file image outline" />
                <Header.Content>Final</Header.Content>
              </Header>

              <div
                style={{
                  width: "100%",
                  height: "300px",
                  display: "inline-block",
                  padding: "10px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
                className="img_preview"
              />
            </div>
          </Modal.Content>
        </Grid.Column>
      </Grid>

      <Modal.Actions>
        <Button
          title="Reset (R)"
          icon="redo"
          circular
          onClick={() => cropper && cropper.clear()}
        />

        <Button
          title="Move Canvas (M)"
          icon="move"
          circular
          onClick={() => cropper && cropper.setDragMode("move")}
        />

        <Button
          title="New CropBox (C)"
          icon="crop"
          circular
          onClick={() => cropper && cropper.setDragMode("crop")}
        />

        <Button
          negative
          content="Cancel"
          icon="cancel"
          onClick={() => setShowModal(false)}
        />

        <Button
          content="Crop Image"
          icon="checkmark"
          positive
          onClick={getCropData}
        />
      </Modal.Actions>
    </Modal>
  );
};

export default CropImageModal;
