const submitForm = document.getElementById("submitForm");
const submittedlist = document.getElementById("submittedListDiv");
const editRelationDiv = document.getElementById("editRelationDiv");

new Sortable(submittedlist, {
  animation: 150,
  ghostClass: "dragging",
  onEnd: function () {
    updateOrderIDs();
  },
});

//my relation class that was supposed to make things easier but updating orderid was too hard so whatever
class Relation {
  constructor(fromTrueId, toTrueId, content) {
    this.fromTrueId = fromTrueId;
    this.toTrueId = toTrueId;
    this.content = content;
  }
}

let submittedRelations = [];

submitForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const submittedName = document.getElementById("charaNameid").value;
  const submittedURL = document.getElementById("charaURLid").value;
  const submittedimage = document.getElementById("charaImageid").value;

  // new div
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");
  entryDiv.style.position = "relative";
  entryDiv.style.marginBottom = "15px";
  entryDiv.style.padding = "5px";
  entryDiv.style.border = "1px solid #afafafff";
  entryDiv.style.borderRadius = "8px";
  entryDiv.style.display = "inline-block";
  entryDiv.style.textAlign = "center";

  //assigning targets and selections and whatever
  entryDiv.addEventListener("click", function () {
    let targetDiv = document.querySelector("#submittedListDiv .target");
    let selectedDiv = document.querySelector("#submittedListDiv .selected");

    if (entryDiv.classList.contains("target")) {
      entryDiv.classList.remove("target");
      if (selectedDiv) selectedDiv.classList.remove("selected");
      updateEditRelation();
      return;
    }

    if (entryDiv.classList.contains("selected")) {
      entryDiv.classList.remove("selected");
      updateEditRelation();
      return;
    }

    if (!targetDiv) {
      entryDiv.classList.add("target");
      updateEditRelation();
      return;
    }

    if (
      !entryDiv.classList.contains("target") &&
      !entryDiv.classList.contains("selected")
    ) {
      if (selectedDiv) selectedDiv.classList.remove("selected");
      entryDiv.classList.add("selected");
      updateEditRelation();
      return;
    }
  });

  entryDiv.dataset.trueId = `${Date.now()}-${Math.floor(
    Math.random() * 100000 //ok sure
  )}`;

  // order badge
  const badge = document.createElement("div");
  badge.classList.add("order-badge");
  badge.style.position = "absolute";
  badge.style.top = "2px";
  badge.style.left = "2px";
  badge.style.background = "rgba(0,0,0,0.7)";
  badge.style.color = "white";
  badge.style.fontSize = "12px";
  badge.style.padding = "2px 5px";
  badge.style.borderRadius = "4px";
  entryDiv.appendChild(badge);

  //image
  const entryImg = document.createElement("img");
  entryImg.src = submittedimage;
  entryImg.alt = submittedName;
  entryImg.style.width = "100px";
  entryImg.style.height = "100px";
  entryImg.style.objectFit = "cover";
  entryImg.style.display = "block";
  entryDiv.appendChild(entryImg);

  //link
  const entryUrl = document.createElement("a");
  entryUrl.href = submittedURL;
  entryUrl.textContent = submittedName;
  entryUrl.target = "_blank";
  entryDiv.appendChild(entryUrl);

  //delete button
  const entryDeleteButton = document.createElement("button");
  entryDeleteButton.type = "button";
  entryDeleteButton.classList.add("btn", "btn-sm", "btn-danger");
  entryDeleteButton.textContent = "Delete";
  entryDeleteButton.style.marginLeft = "10px";
  entryDeleteButton.addEventListener("click", function (e) {
    e.stopPropagation();

    if (
      entryDiv.classList.contains("target") ||
      entryDiv.classList.contains("selected")
    ) {
      entryDiv.classList.remove("target", "selected");
      updateEditRelation(); // refresh preview so it clears
    }

    const trueId = entryDiv.dataset.trueId;
    submittedRelations = submittedRelations.filter(
      (r) => r.fromTrueId !== trueId && r.toTrueId !== trueId
    );

    entryDiv.remove();
    updateOrderIDs(); // update after delete
    refreshRelationsList();
  });
  entryDiv.appendChild(entryDeleteButton);

  //add to list
  submittedlist.appendChild(entryDiv);

  //pdate orderIDs after adding
  updateOrderIDs();

  //reset form
  submitForm.reset();
});

function updateOrderIDs() {
  const entries = submittedlist.querySelectorAll(".entry");
  entries.forEach((div, index) => {
    div.dataset.orderId = index;

    // update badge text/orderid
    const badge = div.querySelector(".order-badge");
    if (badge) {
      badge.textContent = index;
    }
  });
}

function updateEditRelation() {
  const targetDiv = document.querySelector("#submittedListDiv .target");
  const selectedDiv = document.querySelector("#submittedListDiv .selected");

  editRelationDiv.innerHTML = "";

  if (!targetDiv && !selectedDiv) return;

  const preview = document.createElement("div");
  preview.style.display = "flex";
  preview.style.alignItems = "center";
  preview.style.gap = "10px";

  //clone clone....
  function cloneMini(entry) {
    const mini = document.createElement("div");
    mini.style.display = "flex";
    mini.style.flexDirection = "column";
    mini.style.alignItems = "center";

    const img = entry.querySelector("img").cloneNode(true);
    img.style.width = "50px";
    img.style.height = "50px";
    mini.appendChild(img);

    const name = document.createElement("span");
    name.textContent = entry.querySelector("a").textContent;
    name.style.fontSize = "12px";
    mini.appendChild(name);

    return mini;
  }

  if (targetDiv) preview.appendChild(cloneMini(targetDiv));
  if (targetDiv && selectedDiv) {
    const arrow = document.createElement("span");
    arrow.textContent = "→";
    arrow.style.fontSize = "20px";
    preview.appendChild(arrow);
  }
  if (selectedDiv) preview.appendChild(cloneMini(selectedDiv));

  // text input + controls
  const relationContent = document.createElement("div");
  relationContent.style.display = "flex";
  relationContent.style.flexDirection = "column";
  relationContent.style.gap = "8px";

  // Use textarea instead of input
  const relationInput = document.createElement("textarea");
  relationInput.placeholder = "type relation here and click enter/submit";
  relationInput.style.width = "150px";
  relationInput.style.height = "150px";
  relationInput.style.resize = "vertical";
  relationInput.style.padding = "5px";
  relationInput.style.fontFamily = "inherit";
  relationInput.style.fontSize = "14px";
  relationContent.appendChild(relationInput);
  preview.appendChild(relationContent);

  // toggle two-way
  const toggleTwoWay = document.createElement("button");
  toggleTwoWay.classList.add("btn", "btn-sm", "btn-info");
  toggleTwoWay.type = "button";
  toggleTwoWay.textContent = "make two-way";
  toggleTwoWay.dataset.active = "false";

  toggleTwoWay.addEventListener("click", function () {
    const isActive = toggleTwoWay.dataset.active === "true";
    toggleTwoWay.dataset.active = isActive ? "false" : "true";
    toggleTwoWay.style.background = isActive ? "" : "lightgreen";
    toggleTwoWay.textContent = isActive ? "make two-way" : "two-way on";
  });

  relationContent.appendChild(toggleTwoWay);

  // submit button
  const submitBtn = document.createElement("button");
  submitBtn.classList.add("btn", "btn-sm", "btn-info");
  submitBtn.type = "button";
  submitBtn.textContent = "submit relation";
  relationContent.appendChild(submitBtn);

  // delete relation button
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn", "btn-sm", "btn-info");
  deleteBtn.type = "button";
  deleteBtn.textContent = "delete relation";
  deleteBtn.style.background = "lightcoral";

  deleteBtn.addEventListener("click", function () {
    const fromTrueId = targetDiv ? targetDiv.dataset.trueId : null;
    const toTrueId = selectedDiv ? selectedDiv.dataset.trueId : null;

    if (!fromTrueId || !toTrueId) return;

    // filter out matching relation
    const before = submittedRelations.length;
    submittedRelations = submittedRelations.filter(
      (r) => !(r.fromTrueId === fromTrueId && r.toTrueId === toTrueId)
    );

    if (before !== submittedRelations.length) {
      //console.log(`Deleted relation between ${fromTrueId} → ${toTrueId}`);
      refreshRelationsList();
    }
  });

  relationContent.appendChild(deleteBtn);

  // actual submit handler
  function handleSubmit() {
    const fromTrueId = targetDiv ? targetDiv.dataset.trueId : null;
    const toTrueId = selectedDiv ? selectedDiv.dataset.trueId : null;
    const content = relationInput.value;

    if (fromTrueId === null || toTrueId === null || content === "") return; //Then dont even bother lol

    let existingRelation = submittedRelations.find(
      (r) => r.fromTrueId === fromTrueId && r.toTrueId === toTrueId
    );

    if (existingRelation) {
      existingRelation.content = content;
    } else {
      submittedRelations.push(new Relation(fromTrueId, toTrueId, content));
    }

    if (toggleTwoWay.dataset.active === "true") {
      let reverseRelation = submittedRelations.find(
        (r) => r.fromTrueId === toTrueId && r.toTrueId === fromTrueId
      );

      if (reverseRelation) {
        reverseRelation.content = content;
      } else {
        submittedRelations.push(new Relation(toTrueId, fromTrueId, content));
      }
    }

    relationInput.value = "";
    refreshRelationsList();
  }

  relationInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });

  submitBtn.addEventListener("click", handleSubmit);

  editRelationDiv.appendChild(preview);
}

function refreshRelationsList() {
  relationsListDiv.innerHTML = ""; // clear old list
  relationsListDiv.style.maxHeight = "100px";
  relationsListDiv.style.overflowY = "scroll";

  submittedRelations.forEach((rel) => {
    const fromEntry = submittedlist.querySelector(
      //@_@
      `.entry[data-true-id="${rel.fromTrueId}"] a`
    ).textContent;
    const toEntry = submittedlist.querySelector(
      `.entry[data-true-id="${rel.toTrueId}"] a`
    ).textContent;

    const item = document.createElement("div");
    item.textContent = `${fromEntry} → ${toEntry}: "${rel.content}"`;
    item.style.fontSize = "12px";
    item.style.marginBottom = "2px";

    relationsListDiv.appendChild(item);

    //console.log(
    //  `${fromEntry} (${rel.fromTrueId}) -> ${toEntry} (${rel.toTrueId}): "${rel.content}"`
    //);
  });
}

function prepareToHTML() {
  const nameList = [];
  const imageList = [];
  const urlList = [];
  const trueIdList = [];

  const entries = submittedlist.querySelectorAll(".entry");
  entries.forEach((div) => {
    nameList.push(div.querySelector("a").textContent);
    imageList.push(div.querySelector("img").src);
    urlList.push(div.querySelector("a").href);
    trueIdList.push(div.dataset.trueId);
  });

  const numItems = entries.length;
  if (numItems === 0) {
    alert("no entries to export");
    return;
  }
  if (submittedRelations.length === 0) {
    alert("no relations defined to export");
    return;
  }

  //null arrayay
  const relationMatrix = Array.from({ length: numItems }, () =>
    Array(numItems).fill(null)
  );

  submittedRelations.forEach((rel) => {
    const fromIndex = trueIdList.indexOf(rel.fromTrueId);
    const toIndex = trueIdList.indexOf(rel.toTrueId);

    if (fromIndex !== -1 && toIndex !== -1) {
      relationMatrix[fromIndex][toIndex] = rel.content;
    }
  });

  const trueIDsList = {};
  relationMatrix.forEach((row, i) => {
    const varName = `trueID_${i + 1}`;
    trueIDsList[varName] = row; // store real object
  });

  return {
    nameList: nameList,
    imageList: imageList,
    urlList: urlList,
    trueIDsList: trueIDsList,
  };
}

function exportToHTML() {
  const preparedData = prepareToHTML();

  if (!preparedData) {
    return;
  }

  const nameList = preparedData.nameList;
  const imgSrcList = preparedData.imageList;
  const urlList = preparedData.urlList;
  const trueIDsList = preparedData.trueIDsList;

  const numItems = nameList.length;

  const preparedRelationsList = {};
  Object.keys(trueIDsList).forEach((key, i) => {
    preparedRelationsList[`list${i + 1}`] = trueIDsList[key];
  });

  console.log("numItems:", numItems);
  console.log("nameList:", nameList);
  console.log("imgSrcList:", imgSrcList);
  console.log("urlList:", urlList);
  console.log("preparedRelationsList:", preparedRelationsList);

  //this is taken from htmlexportscript.js

  const baseCircleSize = 300;
  let baseIconSize = 100;
  let minIconSize = 40;
  let iconSize = Math.max(
    minIconSize,
    baseIconSize - Math.max(0, numItems - 8) * 2
  );
  let circumference = iconSize * numItems * 1.1;
  let requiredRadius = circumference / (2 * Math.PI);
  let circleSize = Math.max(baseCircleSize, requiredRadius * 2 + iconSize + 40);
  let radius = circleSize / 2 - iconSize / 2 - 10;

  //my circle #Mycircle
  function generateCircleHTML(disableIndices = [], hrefPrefix = "allclosed") {
    let html = `
    <div style="position:relative; width:${circleSize}px; height:${circleSize}px; margin:auto;">
      <div style="
        position:absolute;
        top:50%;
        left:50%;
        width:${radius * 2}px;
        height:${radius * 2}px;
        border:2px dashed #999;
        border-radius:50%;
        transform:translate(-50%, -50%);
      "></div>
  `;

    for (let i = 0; i < numItems; i++) {
      const angle = (360 / numItems) * i;
      const isDisabled = disableIndices.includes(i);
      const href = isDisabled
        ? "javascript:void(0);"
        : `#${hrefPrefix}${i + 1}`;
      const imgSrc = imgSrcList[i % imgSrcList.length];

      html += `
      <div style="position:absolute; top:50%; left:50%; transform:rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) translate(-50%, -50%);">
        <a ${isDisabled ? "" : `data-toggle="collapse"`} href="${href}">
          <img src="${imgSrc}" alt="Toggle ${i + 1}" 
               style="width:${iconSize}px; height:${iconSize}px; object-fit:cover; border-radius:8px; ${
        isDisabled ? "opacity:0.2;" : "animation: fa-fade 1s;"
      }">
        </a>
      </div>
    `;
    }

    html += `</div>`;
    return html;
  }

  // Outer accordion
  let html = `
<div id="outerAccordion" style="overflow:scroll;">
  <div>
    <div id="circleCollapse" class="collapse fade show" data-parent="#outerAccordion" style="margin:auto;">
      <div class="card-body">
        ${generateCircleHTML()} <!-- outer circle -->
      </div>

      <div style="text-align: center">
        <a class="icon-link" href="https://toyhou.se/34862608.responsive-relation-chartf2u" target="_blank">
          <i class="fas fa-brackets"></i>
        </a>
        </div>

    </div>
  </div>
`;

  for (let outer = 0; outer < numItems; outer++) {
    const outerId = outer + 1;
    const outerName = nameList[outer];
    const outerUrl = urlList[outer];
    const relKey = `list${outerId}`;
    const relationRow = preparedRelationsList[relKey];

    // determine which inner indices should be disabled (the null relations and self)
    let disabled = [];
    for (let inner = 0; inner < numItems; inner++) {
      if (inner === outer || relationRow[inner] === null) {
        disabled.push(inner);
      }
    }

    html += `
<div id="allclosed${outerId}" class="collapse fade" data-parent="#outerAccordion">
  <div class="card" style="margin:auto; max-width:700px; margin-top:20px; border-radius:10px;">
    <div class="card-body" style="padding-top:40px;padding-bottom:40px;">
      ${generateCircleHTML(disabled, `inner${outerId}_`)}
      <div style="margin-top:20px; text-align:center;">
        <h5>
          <a href="${outerUrl}" target="_blank" style="text-decoration:none;">
            <strong>${outerName}</strong>
          </a>
        </h5>
        <a data-toggle="collapse" href="#circleCollapse">back...</a>
      </div>
`;

    // build only existing relations
    for (let inner = 0; inner < numItems; inner++) {
      if (inner !== outer && relationRow[inner] !== null) {
        const innerId = inner + 1;
        const innerName = nameList[inner];
        const relationContent = relationRow[inner];

        html += `
      <div id="inner${outerId}_${innerId}" class="collapse fade" data-parent="#allclosed${outerId}" style="margin-top:10px;">
        <div class="card card-body" style="margin:auto;text-align:center; max-width:600px; padding:20px; border-radius:10px; overflow:auto; overflow-wrap: break-word;">
          <h6><strong>${outerName}</strong> → <strong>${innerName}</strong></h6>
          <p>${escapeHTML(relationContent)}</p>
        </div>
      </div>
      `;
      }
    }

    html += `
      </div>
    </div>
  </div>
  `;
  }

  html += `</div>`;

  // ready to output
  document.getElementById("outerAccordion").innerHTML = html;
  document.getElementById("exportBox").textContent = html;
}

function exportToHTMLSingle() {
  const targetDiv = document.querySelector("#submittedListDiv .target");

  const preparedData = prepareToHTML();

  
  if (!preparedData) {
    return;
  }
  
  const nameList = preparedData.nameList;
  const imgSrcList = preparedData.imageList;
  const urlList = preparedData.urlList;
  const trueIDsList = preparedData.trueIDsList;
  let outer = -1;

  if (targetDiv) {
    const targetTrueId = targetDiv.dataset.trueId;
    const trueIdArray = Object.keys(trueIDsList).map((key, i) => {
      return targetDiv.parentElement.querySelectorAll(".entry")[i].dataset
        .trueId;
    });
    outer = trueIdArray.indexOf(targetTrueId);
  }

  const numItems = nameList.length;

  const preparedRelationsList = {};
  Object.keys(trueIDsList).forEach((key, i) => {
    preparedRelationsList[`list${i + 1}`] = trueIDsList[key];
  });

  //this is taken from htmlexportscript.js
  //im lazy

  const baseCircleSize = 300;
  let baseIconSize = 100;
  let minIconSize = 40;
  let iconSize = Math.max(
    minIconSize,
    baseIconSize - Math.max(0, numItems - 8) * 2
  );
  let circumference = iconSize * numItems * 1.1;
  let requiredRadius = circumference / (2 * Math.PI);
  let circleSize = Math.max(baseCircleSize, requiredRadius * 2 + iconSize + 40);
  let radius = circleSize / 2 - iconSize / 2 - 10;

  //my circle #Mycircle
  function generateCircleHTML(disableIndices = [], hrefPrefix = "allclosed") {
    let html = `
    <div style="position:relative; width:${circleSize}px; height:${circleSize}px; margin:auto;">
      <div style="
        position:absolute;
        top:50%;
        left:50%;
        width:${radius * 2}px;
        height:${radius * 2}px;
        border:2px dashed #999;
        border-radius:50%;
        transform:translate(-50%, -50%);
      "></div>
  `;

    for (let i = 0; i < numItems; i++) {
      const angle = (360 / numItems) * i;
      const isDisabled = disableIndices.includes(i);
      const href = isDisabled
        ? "javascript:void(0);"
        : `#${hrefPrefix}${i + 1}`;
      const imgSrc = imgSrcList[i % imgSrcList.length];

      html += `
      <div style="position:absolute; top:50%; left:50%; transform:rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) translate(-50%, -50%);">
        <a ${isDisabled ? "" : `data-toggle="collapse"`} href="${href}">
          <img src="${imgSrc}" alt="Toggle ${i + 1}" 
               style="width:${iconSize}px; height:${iconSize}px; object-fit:cover; border-radius:8px; ${
        isDisabled ? "opacity:0.2;" : "animation: fa-fade 1s;"
      }">
        </a>
      </div>
    `;
    }

    html += `</div>`;
    return html;
  }

  // Outer accordion
  //ill be real this is rlly lazy  i totally could remove this and fix it up but. bwehhhh :p
  let html = `
<div id="outerAccordion" style="overflow:scroll;">
`;

  if (outer != -1) {
    const outerId = outer + 1;
    const outerName = nameList[outer];
    const outerUrl = urlList[outer];
    const relKey = `list${outerId}`;
    const relationRow = preparedRelationsList[relKey];

    // determine which inner indices should be disabled (the null relations and self)
    let disabled = [];
    for (let inner = 0; inner < numItems; inner++) {
      if (inner === outer || relationRow[inner] === null) {
        disabled.push(inner);
      }
    }

    html += `
<div id="allclosed${outerId}" class="collapse fade show" data-parent="#outerAccordion">
  <div class="card" style="margin:auto; max-width:700px; margin-top:20px; border-radius:10px;">
    <div class="card-body" style="padding-top:40px;padding-bottom:40px;">
      ${generateCircleHTML(disabled, `inner${outerId}_`)}
      <div style="margin-top:20px; text-align:center;">
        <h5>
          <a href="${outerUrl}" target="_blank" style="text-decoration:none;">
            <strong>${outerName}</strong>
          </a>
        </h5>
      </div>
`;

    // build only existing relations
    for (let inner = 0; inner < numItems; inner++) {
      if (inner !== outer && relationRow[inner] !== null) {
        const innerId = inner + 1;
        const innerName = nameList[inner];
        const relationContent = relationRow[inner];

        html += `
      <div id="inner${outerId}_${innerId}" class="collapse fade" data-parent="#allclosed${outerId}" style="margin-top:10px;">
        <div class="card card-body" style="margin:auto;text-align:center; max-width:600px; padding:20px; border-radius:10px; overflow:auto; overflow-wrap: break-word;">
          <h6><strong>${outerName}</strong> → <strong>${innerName}</strong></h6>
          <p>${escapeHTML(relationContent)}</p>
        </div>
      </div>
      `;
      }
    }

    html += `
      </div>
    </div>

    <div style="text-align: center">
        <a class="icon-link" href="https://toyhou.se/34862608.responsive-relation-chartf2u" target="_blank">
          <i class="fas fa-brackets"></i>
        </a>
        </div>

  </div>
  `;
  } else {
    alert(" select a target character to export");
    return;
  }

  html += `</div>`;

  // ready to output
  document.getElementById("outerAccordion").innerHTML = html;
  document.getElementById("exportBox").textContent = html;
}

function copyHTML() {
  const exportBox = document.getElementById("exportBox");
  const text = exportBox.textContent;
  const button = document.getElementById("copyButton");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      const originalColor = button.style.backgroundColor;
      button.style.backgroundColor = "green";
      button.textContent = "copied!";
      setTimeout(() => {
        button.style.backgroundColor = originalColor;
        button.textContent = "copy :3";
      }, 1000);
    })
    .catch((err) => {
      console.error(":(");
    });
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br>")
    .replace(/ /g, "&nbsp;");
}

