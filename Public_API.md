## 公共 API (`/nozomi/v1`)

公共 API 不需要认证，用于前端展示已发布的内容。

## 内容 i18n 说明（公共端）

公共端内容 i18n 采用“默认语言保持兼容、非默认语言显式选择”的策略：

- **不传 `i18n` 参数**：返回默认语言内容，保持既有行为不变。
- **传 `i18n=<locale>`**：优先返回指定语言版本；如果该语言版本不存在或未发布，则回退到默认语言内容，并在响应中标记回退信息。
- **结构定位**：`tree` / `by-path` 始终基于共享内容结构；`i18n` 只作用于内容投影，不改变内容在树中的位置与路径定位方式。

### `meta.i18n` 字段说明

在返回 `meta.i18n` 的公共内容读取接口中，字段含义如下：

```json
{
    "meta": {
        "i18n": {
            "current": "en-US",
            "default": "zh-CN",
            "available": ["zh-CN", "en-US"],
            "fallback": false,
            "fallback_to": ""
        }
    }
}
```

- `current`: 当前实际返回内容的语言。
- `default`: 系统默认语言。
- `available`: 当前内容已有的已发布语言列表。
- `fallback`: 是否发生了默认语言回退。
- `fallback_to`: 当 `fallback=true` 时，表示实际回退到的语言。

### 数据集 API

数据集 API 用于返回结构化记录集合，例如音乐、书单、游戏列表。

- 一个 dataset 对应一个内容类型，例如 `music`
- 返回范围固定为该类型根节点下的**直接子节点**
- 仅返回**已发布**记录
- 公共输出以记录值本身为主，仅保留最小元数据：`id` 与 `slug`
- 第一版字段过滤仅支持**一级字段**，不支持嵌套路径

### 54. 获取数据集记录列表

```
GET /nozomi/v1/datasets/:type_slug
```

**查询参数**:

- `page`: 页码，默认 1
- `page_size`: 每页数量，默认 20
- `limit`: `page_size` 的别名
- `fields`: 仅返回 `record` 中指定字段，逗号分隔；不传则返回完整记录
- `sort_by`: 排序字段，支持 `order`（默认）、`created_at`、`updated_at`、`slug`
- `sort_order`: 排序方向，`asc`（默认）或 `desc`
- `filter[字段][操作符]`: 按记录字段过滤，仅支持一级字段
    - 操作符支持：`eq`、`ne`、`gt`、`lt`、`gte`、`lte`、`contains`、`like`、`in`

**响应**:

```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": "uuid",
            "slug": "melt",
            "record": {
                "name": "Melt",
                "cover": "/uploads/melt.jpg",
                "artist": "TK from 凛として時雨"
            }
        }
    ],
    "meta": {
        "current_page": 1,
        "page_size": 20,
        "total_items": 87,
        "total_pages": 5
    }
}
```

**使用示例**:

```
GET /nozomi/v1/datasets/music?page=1&page_size=20
GET /nozomi/v1/datasets/music?fields=name,cover,artist
GET /nozomi/v1/datasets/music?filter[artist][eq]=Aimer
GET /nozomi/v1/datasets/music?filter[name][contains]=love
```

### 55. 获取单条数据集记录

```
GET /nozomi/v1/datasets/:type_slug/:id
```

**说明**:

- `:id` 第一版仅支持内容 ID
- 仅当记录属于对应 dataset，且是该类型根节点的直接子节点时才返回

**响应**:

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": "uuid",
        "slug": "melt",
        "record": {
            "name": "Melt",
            "cover": "/uploads/melt.jpg",
            "artist": "TK from 凛として時雨",
            "album": "Fantastic Magic"
        }
    }
}
```

### 56. 获取内容列表

```
GET /nozomi/v1/contents
```

**描述**: 获取已发布的内容列表（分页+过滤）
**查询参数**:

- `parent_id`: 按父节点过滤，"root"表示根节点下的内容
- `root`: 按根节点路径过滤，如 "guide"
- `i18n`: 指定内容投影语言；不传时返回默认语言版本
- `type_id`: 按内容类型ID过滤
- `type_slug`: 按内容类型slug过滤
- `taxonomy_id`: 按分类ID过滤
- `taxonomy_slug`: 按分类slug过滤
- `tag_id`: 按标签过滤
- `expand`: 扩展字段，逗号分隔，支持 `published_version`；`full` 返回完整数据
- `fields`: 额外附带 `data` 中指定字段，逗号分隔（仅在未使用 `expand=full` 时生效；返回在 `data` 子集内）
- `page`: 页码，默认 1
- `page_size`: 每页数量，默认 20
- `limit`: 限制返回数量（`page_size` 的别名；当未传 `page_size` 时生效）
- `sort_by`: 排序字段，支持 `order`（默认）、`created_at`、`updated_at`、`title`、`slug`（不区分大小写）
- `sort_order`: 排序方向，`asc`（默认）或 `desc`（不区分大小写）
- `search`: 全文模糊搜索（在内容的 `data` JSON 文本中检索）
- `filter[字段][操作符]`: 按内容 `data`(JSON) 中的指定字段进行过滤
    - 操作符支持：`eq`、`ne`、`gt`、`lt`、`gte`、`lte`、`contains`、`like`、`in`
    - 示例：`filter[isTop][eq]=true`、`filter[title][contains]=Go`、`filter[lang][in]=zh,en`

**i18n 说明**:

- 传 `i18n=<locale>` 时，每条内容会独立尝试返回指定语言版本；如果某条内容缺少该语言或该语言未发布，仅该条内容回退到默认语言。
- 列表接口的回退是按内容项独立发生的，因此同一页结果中可能同时存在目标语言内容和默认语言回退内容。
- 本接口在顶层返回 `meta.i18n`；其中 `fallback=true` 表示本次结果中至少有一条内容发生了默认语言回退。

**响应** (轻量级格式):

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "title": "文章标题",
      "slug": "article-slug",
      "path": "blog/article-slug",
      "summary": "文章摘要", // 可选，当内容数据中包含summary字段时返回
      "type": {
        "id": "uuid",
        "name": "文章",
        "slug": "article"
      },
      "taxonomies": [
        {
          "id": "uuid",
          "name": "分类名称",
          "slug": "分类slug"
        }
      ],
      "tags": [
        {
          "id": "uuid",
          "name": "标签名称"
        }
      ],
      "data": {...} // 可选，仅当expand参数包含"full"时返回完整数据
    }
  ],
  "meta": {
    "current_page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5,
    "i18n": {
      "current": "en-US",
      "default": "zh-CN",
      "available": [],
      "fallback": false
    }
  }
}
```

- 列表按内容项独立投影：某条内容缺少目标语言或该语言未发布时，仅该条回退到默认语言；`meta.i18n.fallback=true` 表示本次结果中出现过此类回退。
- `meta.i18n.current` / `default` / `available` / `fallback` 的含义见本文前面的“`meta.i18n` 字段说明”；当发生回退时，可结合 `fallback_to` 判断实际回退到的语言。

**使用示例**:

```
# 获取列表（轻量级）
GET /nozomi/v1/contents?page=1&page_size=20

# 只取前 5 条（limit 是 page_size 的别名）
GET /nozomi/v1/contents?limit=5

# 获取根节点下的内容
GET /nozomi/v1/contents?parent_id=root

# 获取特定根路径下的内容
GET /nozomi/v1/contents?root=guide

# 获取 en-US 内容列表
GET /nozomi/v1/contents?i18n=en-US

# 获取包含完整数据的列表
GET /nozomi/v1/contents?page=1&page_size=20&expand=full

# 附带 data 中指定字段
GET /nozomi/v1/contents?page=1&page_size=20&fields=title,summary,cover

# 按标题排序
GET /nozomi/v1/contents?sort_by=title&sort_order=asc

# 按类型获取，默认使用 order 排序
GET /nozomi/v1/contents?type_slug=archive

# 分类下按自定义顺序
GET /nozomi/v1/contents?taxonomy_slug=tech&sort_by=order&sort_order=asc

# 按 data.isTop 过滤（字段不存在的内容会自然被排除）
GET /nozomi/v1/contents?filter[isTop][eq]=true

# 搜索 + 过滤组合
GET /nozomi/v1/contents?search=gin&filter[title][contains]=API
```

### 57. 获取单个内容

```
GET /nozomi/v1/contents/:id
```

**描述**: 获取指定的已发布内容（完整数据）

**查询参数**:

- `i18n`: 指定内容投影语言；不传时返回默认语言版本

**i18n 说明**:

- 传 `i18n=<locale>` 时，优先返回该内容的指定语言版本；如果该语言版本不存在或未发布，则回退到默认语言。
- 本接口在顶层返回 `meta.i18n`，用于说明本次实际返回的语言、默认语言、已发布语言列表以及是否发生回退。

**响应**:

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": "uuid",
        "data": {
            "title": "标题",
            "summary": "摘要"
        },
        "type": {
            "id": "uuid",
            "name": "文章",
            "slug": "article"
        },
        "taxonomies": [
            {
                "id": "uuid",
                "name": "分类名称",
                "slug": "分类slug"
            }
        ],
        "tags": [
            {
                "id": "uuid",
                "name": "标签名称"
            }
        ]
    },
    "meta": {
        "i18n": {
            "current": "zh-CN",
            "default": "zh-CN",
            "available": ["zh-CN"],
            "fallback": false
        }
    }
}
```

- 当指定的 `i18n` 版本不存在或未发布时，接口会返回默认语言内容，并在 `meta.i18n` 中标记 `fallback=true`，同时给出 `fallback_to`。
- `meta.i18n.current` 表示当前实际返回的语言；如果和请求的 `i18n` 不一致，应结合 `fallback=true` 与 `fallback_to` 理解为已回退到默认语言。

**使用示例**:

```
GET /nozomi/v1/contents/123

GET /nozomi/v1/contents/123?i18n=en-US
```

### 58. 获取分类树

```
GET /nozomi/v1/taxonomies
```

**描述**: 获取完整的分类树结构
**响应**:

```json
[
  {
    "id": "uuid",
    "name": "分类名称",
    "slug": "分类slug",
    "parent_id": "uuid",
    "description": "分类描述",
    "order": 0,
    "children": [...]
  }
]
```

### 59. 获取单个分类

```
GET /nozomi/v1/taxonomies/:id
```

**描述**: 获取指定分类信息（支持ID或slug）
**参数**: `:id` 可以是分类ID或slug
**响应**:

```json
{
    "id": "uuid",
    "name": "分类名称",
    "slug": "分类slug",
    "parent_id": "uuid",
    "description": "分类描述",
    "order": 0
}
```

### 60. 获取内容树

```
GET /nozomi/v1/tree
```

**描述**: 获取指定根节点下的目录树结构（仅返回已发布内容）
**查询参数**:

- `root`: (必需) 根节点路径，使用 `.` 作为路径分隔符，如 "guide" 或 "guide.ctf"
- `depth`: (可选) 树的最大深度限制，0表示无限制，1表示只返回根节点，2表示根节点+1层子节点，以此类推
- `i18n`: (可选) 指定内容投影语言；不传时返回默认语言版本

**i18n 说明**:

- 传 `i18n=<locale>` 时，节点会按目标语言进行内容投影；如果某个节点缺少该语言或该语言未发布，仅该节点回退到默认语言，不会因为单个节点缺翻译而导致整棵树失败。
- `tree` 始终基于共享内容结构；`i18n` 只影响节点内容投影，不影响通过 `root` 定位树结构。

**字段说明**: `is_container` 表示该节点是否为目录节点（空目录也会返回 true）；`has_children` 表示该节点是否存在子节点，即使因 depth 限制未返回 `children` 时也能判断是否可继续展开

**响应**:

```json
{
  "id": "uuid",
  "parent_id": "uuid",
  "slug": "guide",
  "path": "guide",
  "title": "指南",
  "is_container": true,
  "order": 0,
  "has_children": true,
  "children": [
    {
      "id": "uuid",
      "parent_id": "uuid",
      "slug": "ctf",
      "path": "guide/ctf",
      "title": "CTF指南",
      "is_container": true,
      "order": 0,
      "has_children": true,
      "children": [...]
    }
  ]
}
```

**使用示例**:

```
# 获取完整的guide目录树
GET /nozomi/v1/tree?root=guide

# 只获取guide及其直接子节点（深度为2）
GET /nozomi/v1/tree?root=guide&depth=2

# 获取guide.ctf下的树结构，深度限制为3层
GET /nozomi/v1/tree?root=guide.ctf&depth=3

# 获取 en-US 内容树投影
GET /nozomi/v1/tree?root=guide&i18n=en-US
```

- tree 也按节点独立投影：某个节点缺少目标语言或该语言未发布时，该节点回退到默认语言，不会因为单个节点缺翻译而整棵树失败。
- 该接口的回退语义与本文前面的“内容 i18n 说明（公共端）”一致。

### 59. 根据路径获取内容

```
GET /nozomi/v1/contents/by-path/*path
```

**描述**: 通过内容的完整路径获取已发布内容
**参数**: `*path` 内容的materialized path，如 "guide/ctf/intro"

**查询参数**:

- `i18n`: (可选) 指定内容投影语言；不传时返回默认语言版本

**i18n 说明**:

- 传 `i18n=<locale>` 时，优先返回该内容的指定语言版本；如果该语言版本不存在或未发布，则回退到默认语言。
- `by-path` 始终基于共享内容结构进行路径定位；`i18n` 只影响返回内容的语言投影，不改变路径解析方式。

**响应**: 与"获取单个内容"相同

- 当指定的 `i18n` 版本不存在或未发布时，接口会返回默认语言内容，并在 `meta.i18n` 中标记 `fallback=true`，同时给出 `fallback_to`。
- 与“获取单个内容”相同，可通过 `meta.i18n.current`、`fallback` 与 `fallback_to` 判断本次返回的实际语言及是否发生回退。

**使用示例**:

```
GET /nozomi/v1/contents/by-path/guide/ctf/intro

GET /nozomi/v1/contents/by-path/guide/ctf/intro?i18n=en-US
```

### 60. 获取内容统计数据

```
GET /nozomi/v1/stats
```

**描述**: 获取系统内容的统计信息（仅统计已发布内容）

**响应**:

```json
{
    "total_contents": 150,
    "published_contents": 120,
    "draft_contents": 30,
    "recent_contents": 15,
    "contents_by_type": [
        {
            "type_id": "uuid",
            "type_name": "文章",
            "type_slug": "article",
            "count": 80
        },
        {
            "type_id": "uuid",
            "type_name": "页面",
            "type_slug": "page",
            "count": 40
        }
    ],
    "contents_by_taxonomy": [
        {
            "taxonomy_id": "uuid",
            "taxonomy_name": "技术",
            "taxonomy_slug": "tech",
            "count": 50
        },
        {
            "taxonomy_id": "uuid",
            "taxonomy_name": "生活",
            "taxonomy_slug": "life",
            "count": 30
        }
    ]
}
```

**字段说明**:

- `total_contents`: 总内容数（包括草稿）
- `published_contents`: 已发布内容数
- `draft_contents`: 草稿内容数
- `recent_contents`: 最近30天新增的已发布内容数
- `contents_by_type`: 按内容类型分组的统计
- `contents_by_taxonomy`: 按分类分组的统计
