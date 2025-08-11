import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Typography,
  Tag,
  List,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import type { Playlist } from "../services/playlistService";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistItems,
  getPlaylists,
  updatePlaylist,
  updatePlaylistItems,
} from "../services/playlistService";
import { fetchMedias } from "../services/mediaService";
import "./playlist.css";

const { Title, Text } = Typography;

const PLAYER_URL =
  (import.meta as any).env?.VITE_PLAYER_URL ?? "http://localhost:5174";

type Media = {
  id: string;
  nome: string;
  descricao?: string;
  urlArquivo: string;
  tipo: string;
};

function normalizeMedias(arr: any[]): Media[] {
  return (arr || []).map((m: any) => ({
    id: String(m.id),
    nome: m.nome,
    descricao: m.descricao,
    urlArquivo: m.urlArquivo,
    tipo: m.tipo,
  }));
}

export default function PlaylistPage() {
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const [form] = Form.useForm<{ nome: string; descricao?: string; exibirNoPlayer?: boolean }>();
  const [editForm] = Form.useForm<{ nome: string; descricao?: string; exibirNoPlayer?: boolean }>();

  const [selected, setSelected] = useState<Playlist | null>(null);

  const [allMedias, setAllMedias] = useState<Media[]>([]);
  const [playlistMediaIds, setPlaylistMediaIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  async function fetchPlaylistsSafe() {
    setLoading(true);
    try {
      const raw = await getPlaylists();
      const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
      setPlaylists(data);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Falha ao carregar playlists");
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlaylistsSafe();
  }, []);

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      await createPlaylist(values as any);
      message.success("Playlist criada");
      setCreateOpen(false);
      form.resetFields();
      fetchPlaylistsSafe();
    } catch {}
  };

  const onOpenEdit = (pl: Playlist) => {
    setSelected(pl);
    editForm.setFieldsValue({
      nome: pl.nome,

      descricao: pl.descricao || "",
      exibirNoPlayer: (pl as any).exibirNoPlayer ?? false,
    });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!selected) return;
    try {
      const values = await editForm.validateFields();
      await updatePlaylist(selected.id, values as any);
      message.success("Playlist atualizada");
      setEditOpen(false);
      setSelected(null);
      fetchPlaylistsSafe();
    } catch {}
  };

  const onDelete = async (pl: Playlist) => {
    try {
      await deletePlaylist(pl.id);
      message.success("Playlist excluída");
      fetchPlaylistsSafe();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Falha ao excluir playlist");
    }
  };

  const onOpenManage = async (pl: Playlist) => {
    setSelected(pl);
    setManageOpen(true);
    try {
      const [mediasRaw, items] = await Promise.all([fetchMedias(), getPlaylistItems(pl.id)]);
      const medias = normalizeMedias(mediasRaw as any[]);
      setAllMedias(medias);

      const sorted = [...items].sort((a: any, b: any) => a.ordem - b.ordem);
      setPlaylistMediaIds(sorted.map((i: any) => String(i.mediaId)));
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Falha ao carregar itens da playlist");
    }
  };

  const availableMedias = useMemo(() => {
    const lower = search.trim().toLowerCase();
    const notInPlaylist = allMedias.filter((m) => !playlistMediaIds.includes(m.id));
    if (!lower) return notInPlaylist;
    return notInPlaylist.filter(
      (m) =>
        (m.nome || "").toLowerCase().includes(lower) ||
        (m.descricao || "").toLowerCase().includes(lower) ||
        (m.tipo || "").toLowerCase().includes(lower)
    );
  }, [allMedias, playlistMediaIds, search]);

  const selectedMedias = useMemo(() => {
    const map = new Map(allMedias.map((m) => [m.id, m] as const));
    return playlistMediaIds.map((id) => map.get(id)).filter(Boolean) as Media[];
  }, [playlistMediaIds, allMedias]);

  const addToPlaylist = (id: string) => {
    if (playlistMediaIds.includes(id)) return;
    setPlaylistMediaIds((prev) => [...prev, id]);
  };
  const removeFromPlaylist = (id: string) => {
    setPlaylistMediaIds((prev) => prev.filter((x) => x !== id));
  };
  const moveUp = (index: number) => {
    if (index <= 0) return;
    setPlaylistMediaIds((prev) => {
      const clone = [...prev];
      [clone[index - 1], clone[index]] = [clone[index], clone[index - 1]];
      return clone;
    });
  };
  const moveDown = (index: number) => {
    setPlaylistMediaIds((prev) => {
      if (index >= prev.length - 1) return prev;
      const clone = [...prev];
      [clone[index + 1], clone[index]] = [clone[index], clone[index + 1]];
      return clone;
    });
  };

  const onSaveItems = async () => {
    if (!selected) return;
    try {
      await updatePlaylistItems(selected.id, playlistMediaIds); 
      message.success("Itens da playlist atualizados");
      setManageOpen(false);
      setSelected(null);
      setPlaylistMediaIds([]);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Falha ao salvar itens");
    }
  };

  const openPreview = (playlistId: string) => {
    const url = `${PLAYER_URL}/?id=${playlistId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const gridGutter = { xs: 8, sm: 12, md: 16, lg: 16 } as const;

  return (
    <div style={{ padding: 16 }}>
      <Space align="center" style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>🎵 Playlists</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Nova playlist
        </Button>
      </Space>

      {playlists.length === 0 ? (
        <Empty description="Nenhuma playlist cadastrada" />
      ) : (
        <Row gutter={[gridGutter.xs, gridGutter.xs]}>
          {playlists.map((pl) => (
            <Col key={pl.id} xs={24} sm={12} md={8} lg={6}>
              <Card title={<span>{pl.nome}</span>} variant="outlined">
                <Text type="secondary">
                  {pl.descricao || "Sem descrição"}
                </Text>

                <div className="pl-card-actions">
                  <Space.Compact block>
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => openPreview(pl.id)}>
                      Reproduzir
                    </Button>
                    <Button icon={<FolderAddOutlined />} onClick={() => onOpenManage(pl)}>
                      Gerenciar itens
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => onOpenEdit(pl)}>
                      Editar
                    </Button>
                  </Space.Compact>

                  <Popconfirm title="Excluir playlist?" okText="Sim" cancelText="Não" onConfirm={() => onDelete(pl)}>
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Nova playlist"
        open={createOpen}
        onOk={onCreate}
        onCancel={() => setCreateOpen(false)}
        okText="Criar"
        confirmLoading={loading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Nome" name="nome" rules={[{ required: true, message: "Informe um nome" }]}>
            <Input placeholder="Ex.: Reels Instagram" maxLength={100} />
          </Form.Item>
          <Form.Item label="Descrição" name="descricao">
            <Input.TextArea placeholder="(opcional)" rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Editar: ${selected?.nome ?? ""}`}
        open={editOpen}
        onOk={onSaveEdit}
        onCancel={() => setEditOpen(false)}
        okText="Salvar"
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Nome" name="nome" rules={[{ required: true, message: "Informe um nome" }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="Descrição" name="descricao">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`Gerenciar itens – ${selected?.nome ?? ""}`}
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        width={880}
        extra={
          <Space>
            <Button onClick={() => setManageOpen(false)}>Cancelar</Button>
            <Button type="primary" onClick={onSaveItems}>Salvar</Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Title level={5} style={{ marginTop: 0 }}>Mídias disponíveis</Title>
            <Input
              placeholder="Buscar por nome, descrição ou tipo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <div className="pl-list-box pl-list-available">
              {availableMedias.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum resultado" />
              ) : (
                <List
                  dataSource={availableMedias}
                  rowKey={(m) => m.id}
                  renderItem={(m) => (
                    <List.Item
                      actions={[
                        <Button key="add" type="link" onClick={() => addToPlaylist(m.id)}>
                          Adicionar
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={<span>{m.nome} <Tag>{m.tipo}</Tag></span>}
                        description={m.descricao || m.urlArquivo}
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Title level={5} style={{ marginTop: 0 }}>Na playlist (ordem)</Title>
            <div className="pl-list-box">
              {selectedMedias.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Adicione mídias" />
              ) : (
                <List
                  dataSource={selectedMedias}
                  rowKey={(m) => m.id}
                  renderItem={(m, index) => (
                    <List.Item
                      actions={[
                        <Button key="up" icon={<ArrowUpOutlined />} onClick={() => moveUp(index)} disabled={index === 0} />,
                        <Button key="down" icon={<ArrowDownOutlined />} onClick={() => moveDown(index)} disabled={index === selectedMedias.length - 1} />,
                        <Button key="rem" danger type="link" onClick={() => removeFromPlaylist(m.id)}>
                          Remover
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={<span>#{index + 1} – {m.nome} <Tag>{m.tipo}</Tag></span>}
                        description={m.descricao || m.urlArquivo}
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
}
