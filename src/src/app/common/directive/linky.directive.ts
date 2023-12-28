import {AfterContentChecked, Directive, ElementRef, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[appLinky]'
})
export class LinkyDirective implements AfterContentChecked {
  @Input() textHyperlink: string;
  contentCached: string;

  constructor(private element: ElementRef, private _renderer: Renderer2) {
  }

  public ngAfterContentChecked() {
    if (this.contentCached !== this.textHyperlink) {
      this.parseContent(this.element.nativeElement);
    }
  }

  parseContent(element) {
    if (this.textHyperlink.trim() !== '') {
      let content = this.textHyperlink;
      content = this.escapeString(content);
      content = this.parseLink(content);
      this.contentCached = this.textHyperlink;
      this._renderer.setProperty(element, 'innerHTML', content);
    }
  }

  escapeString(text) {
    if (text) {
      text = $("<div />").text(text).html();
      text = text.replace(/\n/g, "<br />");
    }

    return text;
  }

  parseLink(text) {
    if (text) {
      const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      text = text.replace(exp, function(match) {
      const link  = match;
      const linkText = link;

      return "<a href=\"" + link + "\" target=\"_blank\" title=\"" + link + "\">" + linkText + "</a>";
      });
    }
    return text;
  }



}
