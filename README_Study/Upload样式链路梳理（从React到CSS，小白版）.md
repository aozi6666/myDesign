## 先用一句话串起来 Upload 这条线




---


---
---

## 3) Upload 主组件：从 props → 状态 → className

核心代码在 `upload.tsx` 里：

### 3.1 组件签名和内部状态

```tsx
export const Upload: FC<UploadProps> = (props) => {
  const {
    action,
    defaultFileList,
    beforeUpload,
    onProgress,
    onSuccess,
    onError,
    onChange,
    onRemove,
    name = 'file',
    headers,
    data,
    withCredentials,
    accept,
    multiple,
    children,
    drag,
  } = props

  const fileInput = useRef<HTMLInputElement>(null)
  const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList || [])
  ...
}
```

- **`fileList` 这一坨状态**：就是“当前页面上所有上传记录”的数据来源。
- 所有和 UI 有关的东西（文件名、进度、成功/失败图标）都**从 `fileList` 里读**，而不是直接去读 DOM。

### 3.2 关键 DOM 结构：和样式强相关的 className

```tsx
return (
  <div className="viking-upload-component">
    <div
      className="viking-upload-input"
      style={{ display: 'inline-block' }}
      onClick={handleClick}
    >
      {drag ? (
        <Dragger onFile={(files) => { uploadFiles(files, true) }}>
          {children}
        </Dragger>
      ) : (
        children
      )}
      <input
        className="viking-file-input"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={handleFileChange}
        type="file"
        accept={accept}
        multiple={multiple}
      />
    </div>

    <UploadList
      fileList={fileList}
      onRemove={handleRemove}
    />
  </div>
)
```

和样式相关的几个 class：

- **`viking-upload-component`**：Upload 整个组件外层包裹。
- **`viking-upload-input`**：包裹触发区域（按钮 / 拖拽框）。
- **`viking-file-input`**：
  - 真正的 `<input type="file" />`。
  - 被内联样式 `display: 'none'` 隐藏掉，只负责**弹系统文件选择框**。
- **`UploadList`** 子组件里会再渲染一堆列表项 class（见下一节）。

### 3.3 关键链路（小白版）：选择文件后，代码是怎么一路“走到 axios.post”的？

这一条链路，完全对应你在 `upload.tsx` 里看到的几段代码：

#### 第一步：用户“点一下”触发区域（按钮/拖拽框）

- 触发的是 `div.viking-upload-input` 的 `onClick={handleClick}`
- `handleClick` 做的事很简单：用 ref 拿到隐藏的 input，然后调用浏览器的原生能力弹出文件选择框：

```tsx
const fileInput = useRef<HTMLInputElement>(null)
const handleClick = () => {
  if (fileInput.current) {
    fileInput.current.click()
  }
}
```

#### 第二步：用户在系统文件选择框里选了文件

这时会触发隐藏 input 的 `onChange={handleFileChange}`：

```tsx
<input
  className="viking-file-input"
  style={{ display: 'none' }}
  ref={fileInput}
  onChange={handleFileChange}
  type="file"
  accept={accept}
  multiple={multiple}
/>
```

你可以把这段 input 理解为：

- **`display: none`**：它不负责“长得好看”，只负责“让浏览器给你 File / FileList”
- **`accept`**：限制可选文件类型（比如 `image/*`）
- **`multiple`**：允许一次选择多个文件

#### 第三步：`handleFileChange` 拿到文件列表，交给 `uploadFiles`

```tsx
const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (!files) return
  uploadFiles(files)
  if (fileInput.current) {
    fileInput.current.value = ''
  }
}
```

几个小白容易忽略、但很关键的点：

- **`e.target.files`** 才是真正的文件列表（类型是 `FileList`）
- **清空 `fileInput.current.value`**：这样你连续选择“同一个文件”时，也能再次触发 `onChange`

#### 第四步：`uploadFiles` 决定“每个文件要不要上传 / 要不要先处理一下再上传”

`FileList` 不是数组，所以先 `Array.from(files)` 变成数组，然后对每个文件走分支：

```tsx
const uploadFiles = (files: FileList) => {
  const postFiles = Array.from(files)
  postFiles.forEach(file => {
    if (!beforeUpload) {
      post(file)
    } else {
      const result = beforeUpload(file)
      if (result && result instanceof Promise) {
        result.then(processedFile => post(processedFile))
      } else if (result !== false) {
        post(file)
      }
    }
  })
}
```

理解这个分支就够了：

- **没传 `beforeUpload`**：直接 `post(file)` 上传
- **`beforeUpload(file)` 返回 Promise**：说明你要异步处理（例如压缩图片），处理完再 `post(processedFile)`
- **`beforeUpload(file)` 返回 `false`**：这次文件就“拦截掉”，不上传

#### 第五步：`post(file)` 真正发请求（axios + FormData）

`post` 分两件事：先把 UI 里要展示的文件状态塞进 `fileList`，再发请求并不断更新状态。

1) 先创建一个内部文件对象 `_file`（这会影响列表渲染、样式 class）：

- `status: 'ready'`：刚准备上传
- `percent: 0`：进度条从 0 开始

2) 用 `FormData` 组装 `multipart/form-data`：

- `formData.append(name || 'file', file)`：把文件本体放进去
- 如果你传了 `data`：就会把额外字段也 append 进去（例如 `userId`、`token`）

3) `axios.post(action, formData, {...})`：

- **`onUploadProgress`**：浏览器会不断回调上传进度，你这里把：
  - `percent` 更新
  - `status` 改成 `'uploading'`
  - 触发 `onProgress(percentage, _file)`
- **成功**：
  - 把 `status` 改成 `'success'`
  - 写入 `response`
  - 触发 `onSuccess`、`onChange`
- **失败**：
  - 把 `status` 改成 `'error'`
  - 写入 `error`
  - 触发 `onError`、`onChange`

最终效果就是：**网络层面的进度/成功/失败 → 更新 `fileList` → `UploadList` 重新渲染 → className 变化 → SCSS 规则生效**。

> 注意：`viking-upload-component` 和 `viking-upload-input` 在当前 `_style.scss` 里**没有专门的样式规则**，它们更多是语义性包裹。真正明显的视觉样式集中在：
> - 拖拽区域：`viking-uploader-dragger`
> - 上传列表：`viking-upload-list`、`viking-upload-list-item` 等。

---


## 8) 从 React 到 CSS：再画一遍 Upload 的“调用链”

结合上面所有内容，把 Upload 的链路再按顺序梳理一遍：

### 第一步：你在页面里写用法（`App.tsx` / Stories）

```tsx
<Upload action="...">
  <Button size="lg" btnType="primary">
    <Icon icon="upload" /> 点击上传
  </Button>
</Upload>
```

或者拖拽版：

```tsx
<Upload action="..." multiple drag>
  <Icon icon="upload" size="5x" theme="secondary" />
  <p>点击或者拖动到此区域进行上传</p>
</Upload>
```

此时你只是表达需求：“我要一个可以上传的区域”。

### 第二步：TypeScript 用 `UploadProps` / `UploadFile` 帮你写对代码

- 检查你有没有传 `action`。
- 提示你 `beforeUpload`、`onSuccess` 等的参数类型。
- 规定内部 `fileList` 的结构。

它们是**开发时**的辅助，不会参与浏览器运行。

### 第三步：React 运行 Upload 组件逻辑（`upload.tsx`）

- 生成 `fileList` 状态，每个 `UploadFile` 记录 name、size、status、percent 等。
- 渲染出 HTML 结构：

  - 有点击触发的按钮区域 / 拖拽区域。
  - 隐藏的 `<input type="file" />`。
  - 根据 `fileList` 渲染出 `<ul class="viking-upload-list">` 及每行 `<li>`。

- 在拖拽过程中，根据 `dragOver` 切换 `class="viking-uploader-dragger is-dragover"`。
- 在上传不同阶段，更新 `UploadFile.status` / `percent`，从而让 React 重新渲染不同的图标和类名（`file-name-error` 等）。

### 第四步：浏览器拿到 DOM + class，匹配 SCSS 编译后的 CSS

- 对拖拽框：

  - `class="viking-uploader-dragger"` → 应用基础灰底虚线框样式。
  - 多一个 `is-dragover` → 应用高亮加粗边框、淡主色背景。

- 对上传列表：

  - `ul.viking-upload-list` → 去掉默认圆点。
  - `li.viking-upload-list-item` → 设置行高、圆角、hover 背景。
  - `.file-name-error` → 文字 + 图标变红。
  - hover 时：`.file-status` 隐藏、`.file-actions` 显示。

### 第五步：SCSS 从哪里来？`_style.scss` 被总入口 `index.scss` 引入

和 Button 一样，你最终会在 `styles/index.scss` 里统一 import 所有组件的 `_style.scss`，然后在应用入口（比如 `App.tsx`）里引入这个 index，让全部 CSS 生效。

---

## 9) 用一句话总结 Upload 的“样式链路思维模型”

**Upload 样式链路的核心模型是：**

> **“Upload（React）用状态驱动 className：`viking-xxx` / `file-name-error` / `is-dragover`；  
> Upload 的 `_style.scss` 用这些 class + 全局变量 `$primary` 等定义视觉；  
> 浏览器只是按照 class 匹配 CSS，把‘上传过程’这套状态画出来。”**

以后你再做别的复杂组件（比如步骤条、通知、表单校验信息），其实都可以沿用这套思路：

- **用 TypeScript 类型把组件 API 和内部状态描述清楚；**
- **用 React 把“状态 → className”这一层写清楚；**
- **用 SCSS（变量 + 局部 `_style.scss`）决定每种 class 的外观；**
- **最后统一由 `styles/index.scss` 接入应用。**

这样看，Upload 虽然功能上更复杂，但整体“从 React 到 CSS 的路径”其实和 Button 完全是一套模式。

