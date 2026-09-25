# Optional JetEngine relations

Read only when relation work is requested. Identify the exact relation, parent and child types, cardinality and required/optional status through the selected site profile plus live discovery. A standard WordPress `meta` field is not necessarily a JetEngine relation.

The site must enable and save both “Register get items/item REST API Endpoint” and “Register update REST API Endpoint” for the relevant relation. Preserve the configured capability restrictions. If not enabled, report the setup needed; an instruction to connect one article does not justify rewriting unrelated relation settings.

Read current parents: `GET /jet-rel/{relation_id}/parents/{post_id}`. Read children: `GET /jet-rel/{relation_id}/children/{project_id}`. Verify both selected objects' type/title/ID before writing.

For attaching a project parent from a blog child:

```json
{
  "parent_id": 123,
  "child_id": 456,
  "context": "parent",
  "store_items_type": "update"
}
```

POST to `/jet-rel/{relation_id}`. `update` adds a connection; `replace` replaces existing items in the selected context; `disconnect` removes specified connections. Do not rely on the endpoint default, which can be `replace`. For one-to-many, a child should not acquire a second parent: inspect existing parents and clarify an ambiguous replacement request before making it. If already connected to the requested parent, skip the write. Read parents again after success and verify the intended ID; optionally read the parent's children.

If no project was requested, skip the relation entirely. A plain upload should preserve existing connections, not clear them.

Source: [Crocoblock relation REST documentation](https://crocoblock.com/knowledge-base/jetengine/jetengine-getting-and-updating-relation-data-via-rest-api/).
