class WikiEntry {
  key: string;
  bookKey: string;
  date: { year: number; month: number; day: number };
  title: string;
  content: string;
  category: string; // "character" | "plot" | "glossary" | "worldbuilding" | "custom"
  tags: string[];
  cfi: string;
  chapter: string;
  constructor(
    bookKey: string,
    title: string,
    content: string,
    category: string,
    tags: string[],
    cfi: string = "",
    chapter: string = ""
  ) {
    this.key = new Date().getTime() + "";
    this.bookKey = bookKey;
    this.date = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
    };
    this.title = title;
    this.content = content;
    this.category = category;
    this.tags = tags;
    this.cfi = cfi;
    this.chapter = chapter;
  }
}

export default WikiEntry;
