import React from "react";
import "./wikiPanel.css";
import { Trans } from "react-i18next";
import Parser from "html-react-parser";
import DOMPurify from "dompurify";
import { marked } from "marked";
import WikiEntry from "../../models/Wiki";
import { wikiCategoryLabels, wikiCategoryIcons } from "../../utils/wiki/prompts";
import { generateWiki, generateWikiCategory } from "../../utils/wiki/wikiService";

interface WikiPanelProps {
  bookKey: string;
  bookName: string;
  htmlBook: any;
  wikis: WikiEntry[];
  onSaveWiki: (wiki: WikiEntry) => void;
  onDeleteWiki: (key: string) => void;
  t: (title: string) => string;
}

interface WikiPanelState {
  isGenerating: boolean;
  progressMessage: string;
  errorMessage: string;
  expandedEntry: string | null;
  currentFilter: string; // category filter
}

class WikiPanel extends React.Component<WikiPanelProps, WikiPanelState> {
  _isMounted: boolean;
  constructor(props: WikiPanelProps) {
    super(props);
    this._isMounted = false;
    this.state = {
      isGenerating: false,
      progressMessage: "",
      errorMessage: "",
      expandedEntry: null,
      currentFilter: "all",
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  safeSetState = (state: Partial<WikiPanelState>) => {
    if (this._isMounted) this.setState(state as any);
  };

  handleGenerateAll = async () => {
    this.safeSetState({ isGenerating: true, progressMessage: "", errorMessage: "" });
    await generateWiki(
      this.props.bookKey,
      this.props.bookName,
      this.props.htmlBook,
      (msg) => this.safeSetState({ progressMessage: msg }),
      (entries) => {
        entries.forEach((e) => this.props.onSaveWiki(e));
        this.safeSetState({ isGenerating: false, progressMessage: "" });
      },
      (err) => this.safeSetState({ isGenerating: false, errorMessage: err })
    );
  };

  handleGenerateCategory = async (category: string) => {
    this.safeSetState({ isGenerating: true, progressMessage: "", errorMessage: "" });
    await generateWikiCategory(
      this.props.bookKey,
      this.props.htmlBook,
      category,
      (msg) => this.setState({ progressMessage: msg }),
      (entries) => {
        entries.forEach((e) => this.props.onSaveWiki(e));
        this.setState({ isGenerating: false, progressMessage: "" });
      },
      (err) => this.setState({ isGenerating: false, errorMessage: err })
    );
  };

  handleDelete = (key: string) => {
    if (window.confirm(this.props.t("Delete this wiki entry?"))) {
      this.props.onDeleteWiki(key);
    }
  };

  filteredWikis = () => {
    if (this.state.currentFilter === "all") return this.props.wikis;
    return this.props.wikis.filter(
      (w) => w.category === this.state.currentFilter
    );
  };

  renderMarkdown = (content: string) => {
    return Parser(
      DOMPurify.sanitize(marked.parse(content) + "<address></address>") || " ",
      { replace: () => {} }
    );
  };

  render() {
    const categories = Object.keys(wikiCategoryLabels);
    const filtered = this.filteredWikis();

    return (
      <div className="wiki-panel">
        {/* Generation buttons */}
        {this.props.wikis.length === 0 && !this.state.isGenerating && (
          <div className="wiki-generate-section">
            <div className="wiki-generate-intro">
              <Trans>Generate AI-powered wiki entries for this book, including character profiles, plot summaries, and glossary terms.</Trans>
            </div>
            <div
              className="wiki-generate-button"
              onClick={this.handleGenerateAll}
            >
              <Trans>Generate Full Wiki</Trans>
            </div>
            <div className="wiki-generate-sub-buttons">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="wiki-generate-sub-button"
                  onClick={() => this.handleGenerateCategory(cat)}
                >
                  {wikiCategoryIcons[cat]} {wikiCategoryLabels[cat]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {this.state.isGenerating && (
          <div className="wiki-generating">
            <span className="wiki-spinner"></span>
            <span>{this.state.progressMessage}</span>
          </div>
        )}

        {/* Error */}
        {this.state.errorMessage && (
          <div className="wiki-error">{this.state.errorMessage}</div>
        )}

        {/* Category filter tabs */}
        {filtered.length > 0 && (
          <div className="wiki-filter-tabs">
            <span
              className={
                this.state.currentFilter === "all"
                  ? "wiki-filter-tab-active"
                  : "wiki-filter-tab"
              }
              onClick={() => this.setState({ currentFilter: "all" })}
            >
              <Trans>All</Trans> ({this.props.wikis.length})
            </span>
            {categories.map((cat) => {
              const count = this.props.wikis.filter(
                (w) => w.category === cat
              ).length;
              if (count === 0) return null;
              return (
                <span
                  key={cat}
                  className={
                    this.state.currentFilter === cat
                      ? "wiki-filter-tab-active"
                      : "wiki-filter-tab"
                  }
                  onClick={() => this.setState({ currentFilter: cat })}
                >
                  {wikiCategoryIcons[cat]} {wikiCategoryLabels[cat]} (
                  {count})
                </span>
              );
            })}
          </div>
        )}

        {/* Wiki entries */}
        <div className="wiki-entries">
          {filtered.map((entry) => (
            <div key={entry.key} className="wiki-entry">
              <div
                className="wiki-entry-header"
                onClick={() =>
                  this.setState({
                    expandedEntry:
                      this.state.expandedEntry === entry.key
                        ? null
                        : entry.key,
                  })
                }
              >
                <span className="wiki-entry-toggle">
                  {this.state.expandedEntry === entry.key ? "▼" : "▶"}
                </span>
                <span className="wiki-entry-icon">
                  {wikiCategoryIcons[entry.category] || "📝"}
                </span>
                <span className="wiki-entry-title">{entry.title}</span>
                <span
                  className="wiki-entry-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleDelete(entry.key);
                  }}
                >
                  ✕
                </span>
              </div>
              {this.state.expandedEntry === entry.key && (
                <div className="wiki-entry-content">
                  {this.renderMarkdown(entry.content)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Re-generate button when entries exist */}
        {this.props.wikis.length > 0 && !this.state.isGenerating && (
          <div className="wiki-regenerate-section">
            <div
              className="wiki-generate-button"
              style={{ marginTop: "10px" }}
              onClick={this.handleGenerateAll}
            >
              <Trans>Re-generate Wiki</Trans>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default WikiPanel;
