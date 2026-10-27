(() => {
  "use strict";

  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  function clean(value) {
    return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  }

  function esc(value) {
    return clean(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function run(text, options = {}) {
    const rtl = options.rtl === false ? '<w:rtl w:val="0"/>' : "<w:rtl/>";
    const bold = options.bold ? "<w:b/>" : "";
    const size = options.size ? `<w:sz w:val="${options.size}"/>` : "";
    const color = options.color ? `<w:color w:val="${options.color}"/>` : "";
    const segments = clean(text).split(/\r?\n/);
    return segments.map((segment, index) => `${index ? "<w:br/>" : ""}<w:r><w:rPr>${rtl}${bold}${size}${color}<w:lang w:val="he-IL" w:bidi="he-IL"/></w:rPr><w:t xml:space="preserve">${esc(segment)}</w:t></w:r>`).join("");
  }

  function para(text, options = {}) {
    const align = options.align || "right";
    const spacing = options.after ?? 120;
    return `<w:p><w:pPr><w:bidi/><w:jc w:val="${align}"/><w:spacing w:after="${spacing}"/></w:pPr>${run(text, options)}</w:p>`;
  }

  function mixedPara(prefix, number, suffix = "") {
    return `<w:p><w:pPr><w:bidi/><w:jc w:val="right"/><w:spacing w:after="120"/></w:pPr>${run(prefix)}${run(number, { rtl: false, bold: true })}${run(suffix)}</w:p>`;
  }

  function pageBreak() {
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  }

  function dataUrlBytes(dataUrl) {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipStored(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const [name, input] of files) {
      const nameBytes = encoder.encode(name);
      const data = typeof input === "string" ? encoder.encode(input) : input;
      const checksum = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length + data.length);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint32(14, checksum, true);
      view.setUint32(18, data.length, true);
      view.setUint32(22, data.length, true);
      view.setUint16(26, nameBytes.length, true);
      local.set(nameBytes, 30);
      local.set(data, 30 + nameBytes.length);
      localParts.push(local);

      const central = new Uint8Array(46 + nameBytes.length);
      const directory = new DataView(central.buffer);
      directory.setUint32(0, 0x02014b50, true);
      directory.setUint16(4, 20, true);
      directory.setUint16(6, 20, true);
      directory.setUint16(10, 0, true);
      directory.setUint32(16, checksum, true);
      directory.setUint32(20, data.length, true);
      directory.setUint32(24, data.length, true);
      directory.setUint16(28, nameBytes.length, true);
      directory.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);
      offset += local.length;
    }
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    return new Blob([...localParts, ...centralParts, end], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  function drawing(rId, name, docPrId) {
    const cx = 2530000;
    const cy = 255000;
    return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${docPrId}" name="${esc(name)}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="${esc(name)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  }

  function reportTable(title, trials, labeler, relationById, nextDocPr) {
    let xml = para(title, { bold: true, size: 28, after: 100 });
    xml += '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D8E4E0"/><w:left w:val="single" w:sz="4" w:color="D8E4E0"/><w:bottom w:val="single" w:sz="4" w:color="D8E4E0"/><w:right w:val="single" w:sz="4" w:color="D8E4E0"/><w:insideH w:val="single" w:sz="4" w:color="E6EEEB"/><w:insideV w:val="single" w:sz="4" w:color="E6EEEB"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="4500"/><w:gridCol w:w="4500"/></w:tblGrid>';
    for (let index = 0; index < trials.length; index += 2) {
      xml += "<w:tr>";
      for (let column = 0; column < 2; column += 1) {
        const trial = trials[index + column];
        xml += '<w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar></w:tcPr>';
        if (trial) {
          xml += drawing(relationById.get(trial.id), trial.id, nextDocPr());
          xml += para(labeler(trial), { size: 18, after: 40 });
        } else xml += para("");
        xml += "</w:tc>";
      }
      xml += "</w:tr>";
    }
    return xml + "</w:tbl>";
  }

  function buildDocument(state, relationById) {
    let docPr = 1;
    const nextDocPr = () => docPr++;
    const words = state.trials.filter((trial) => trial.userChoice === "word");
    const nonwords = state.trials.filter((trial) => trial.userChoice === "nonword");
    const correct = (trial) => trial.userChoice === trial.truth;
    const truth = (trial) => trial.truth === "word" ? "מילה" : "לא־מילה";
    const today = new Intl.DateTimeFormat("he-IL", { dateStyle: "long" }).format(new Date());

    let body = para("דוח פענוח פעילות נוירון", { bold: true, size: 38, align: "center", after: 180 });
    body += para(`תאריך: ${today}`, { align: "center" });
    body += para("חלוקת המיון הידני", { bold: true, size: 32, after: 140 });
    body += reportTable("סווגו כמילה", words, (trial) => correct(trial) ? "✓ נכון" : `✕ לא נכון · התשובה הנכונה: ${truth(trial)}`, relationById, nextDocPr);
    body += para("");
    body += reportTable("סווגו כלא־מילה", nonwords, (trial) => correct(trial) ? "✓ נכון" : `✕ לא נכון · התשובה הנכונה: ${truth(trial)}`, relationById, nextDocPr);
    body += mixedPara("תוצאת המיון הידני: ", `${state.correctCount}/20`, " תשובות נכונות");
    body += mixedPara("אחוז ההצלחה שחושב: ", `${state.percentAnswer}%`);
    body += para(`אחוז צפוי בניחוש אקראי: ${state.randomGuessAnswer}%`);
    body += para("השוואה לניחוש אקראי:", { bold: true });
    body += para(state.randomComparison);
    body += pageBreak();
    body += para("17 מתוך 20", { bold: true, size: 32, align: "center" });
    body += para("חשבו את אחוז ההצלחה של המודל", { bold: true });
    body += para(`${state.modelPercentAnswer}%`);
    body += para("השוו את אחוז ההצלחה של המודל לאחוז ההצלחה שלכם/ן ולאחוז הצלחה אקראי", { bold: true });
    body += para(state.modelComparison);
    body += para("מה נוכל לומר כמדענים/ות על התפקיד של הנוירון מהעובדה שהמודל הצליח לנבא מהפעילות שלו מה האדם ראה?", { bold: true });
    body += para(state.finalInterpretation);
    body += para("מה מודל AI צריך בשביל להצליח לפענח את פעילות הנוירון?", { bold: true });
    body += para(state.mcq1);
    body += para("איך נדע שמודל ה-AI הצליח?", { bold: true });
    body += para(state.mcq2);
    body += para("מקור: Wang et al. (2025), Scientific Data, doi:10.1038/s41597-025-05839-3", { size: 18, color: "607579" });
    body += '<w:sectPr><w:bidi/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900"/></w:sectPr>';

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}</w:body></w:document>`;
  }

  function download(state) {
    if (!state || !Array.isArray(state.trials) || state.trials.length !== 20
      || !Array.isArray(state.aiTrials) || state.aiTrials.length !== 100
      || !state.modelResult) throw new Error("Invalid report state");
    const relationById = new Map();
    const imageRelations = [];
    const mediaFiles = [];
    const reportTrials = [...state.trials];
    reportTrials.forEach((trial, index) => {
      const rid = `rId${index + 10}`;
      const mediaName = `trial-${String(index + 1).padStart(3, "0")}.png`;
      relationById.set(trial.id, rid);
      imageRelations.push(`<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaName}"/>`);
      mediaFiles.push([`word/media/${mediaName}`, dataUrlBytes(trial.src)]);
    });

    const documentXml = buildDocument(state, relationById);
    const rels = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>${imageRelations.join("")}</Relationships>`;
    const contentTypes = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>';
    const rootRels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
    const styles = `<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="${W}"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:lang w:val="he-IL" w:bidi="he-IL"/></w:rPr></w:style></w:styles>`;
    const settings = `<?xml version="1.0" encoding="UTF-8"?><w:settings xmlns:w="${W}"><w:themeFontLang w:val="he-IL" w:bidi="he-IL"/><w:defaultTabStop w:val="708"/></w:settings>`;
    const files = [
      ["[Content_Types].xml", contentTypes],
      ["_rels/.rels", rootRels],
      ["word/document.xml", documentXml],
      ["word/_rels/document.xml.rels", rels],
      ["word/styles.xml", styles],
      ["word/settings.xml", settings],
      ...mediaFiles,
    ];
    const blob = zipStored(files);
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "קומה 2 - חידה 4 - פענוח פעילות נוירון השפה.docx";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 30000);
    return Promise.resolve();
  }

  window.NeuronReport = { download };
})();
