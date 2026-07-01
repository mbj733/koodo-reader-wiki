import { connect } from "react-redux";
import { stateType } from "../../store";
import { withTranslation } from "react-i18next";
import WikiPanel from "./WikiPanel";
import { handleSaveWiki, handleDeleteWiki } from "../../store/actions";

const mapStateToProps = (state: stateType) => {
  return {
    wikis: state.reader.wikis,
    htmlBook: state.reader.htmlBook,
  };
};

const actionCreator = {
  onSaveWiki: handleSaveWiki,
  onDeleteWiki: handleDeleteWiki,
};

// The component also needs bookKey/bookName from parent
export default connect(
  mapStateToProps,
  actionCreator
)(withTranslation()(WikiPanel as any) as any);
