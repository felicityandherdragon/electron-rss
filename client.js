const { ipcMain } = require("electron")
const Store = require("electron-store")
const store = new Store()
const Parser = require("rss-parser")

document.addEventListener("DOMContentLoaded", (event) => {
  console.log(store.get("feeds"))
  document.querySelector("#add-blog").addEventListener("click", () => {
    document.querySelector("#main-screen").classList.add("hidden")
    document.querySelector("#form").classList.remove("hidden")
  })

  document.querySelector("#back").addEventListener("click", () => {
    document.querySelector("#main-screen").classList.remove("hidden")
    document.querySelector("#form").classList.add("hidden")
  })

  document.querySelector("form").addEventListener("submit", () => {
    store.set("feeds", [
      ...(store.get("feeds") || []),
      document.querySelector("#feedurl").value,
    ])
  })
  
  const getPosts = async () => {
    const posts = []
    const parser = new Parser()

    for (const feed of store.get("feeds")) {
      const data = await parser.parseURL(feed)

      data.items.slice(0, 10).forEach((item) => {
        posts.push({
          title: item.title,
          link: item.link,
          date: item.isoDate,
          name: feed.name,
        })
      })
    }

    return posts
  }

  const rerender = (posts) => {
    document.querySelector("tbody").innerHTML = ""

    posts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((value, index) => {
        const link = document.createElement("a")
        link.setAttribute("href", value.link)
        link.value = value.title

        const div1 = document.createElement("div")
        div1.setAttribute(
          "class",
          "text-sm leading-5 font-medium text-gray-900 underline"
        )
        div1.appendChild(link)

        const div2 = document.createElement("div")
        div2.setAttribute("class", "text-sm leading-5 text-gray-500")
        div2.innerText = value.title

        const divWrapper1 = document.createElement("div")
        divWrapper1.setAttribute("class", "ml-4")
        divWrapper1.appendChild(div1)
        divWrapper1.appendChild(div2)

        const divWrapper2 = document.createElement("div")
        divWrapper2.setAttribute("class", "flex items-center")
        divWrapper2.appendChild(divWrapper1)

        const td_1 = document.createElement("td")
        td_1.appendChild(divWrapper2)

        const div1_2 = document.createElement("div")
        div1_2.setAttribute("class", "text-sm leading-5 text-gray-900")
        div1_2.innerText = new Date(value.date).toDateString()

        const td_2 = document.createElement("td")
        td_2.setAttribute(
          "class",
          "px-6 py-4 whitespace-no-wrap border-b border-gray-200"
        )
        td_2.appendChild(div1_2)

        const tr = document.createElement("tr")
        tr.appendChild(td_1)
        tr.appendChild(td_2)

        const item = document.createDocumentFragment()
        item.appendChild(tr)

        document.querySelector("tbody").appendChild(item)
      })
    }

    getPosts().then((posts) => {
      rerender(posts)
    })
})

