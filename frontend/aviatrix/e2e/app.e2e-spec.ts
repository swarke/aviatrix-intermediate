import { AviatrixPage } from './app.po';

describe('aviatrix App', () => {
  let page: AviatrixPage;

  beforeEach(() => {
    page = new AviatrixPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
