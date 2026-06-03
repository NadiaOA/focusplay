"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getProfile, UserProfile } from "@/lib/store"

export default function ReportePadresPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [report, setReport] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setProfile(getProfile())
  }, [])

  const handleGenerateReport = async () => {
    if (!profile) return
    if (!profile.activityHistory || profile.activityHistory.length === 0) {
      setReport("No hay suficientes datos registrados. Pídele al niño que juegue un rato en el módulo 'Amigos' para recolectar información.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: profile.name,
          history: profile.activityHistory,
          avgResponseTime: profile.avgResponseTime,
          errorRate: profile.errorRate,
        }),
      })
      const data = await res.json()
      setReport(data.report)
    } catch (err) {
      setReport("Hubo un problema al contactar a la IA. Revisa tu conexión a internet.")
    }
    setLoading(false)
  }

  const handleDownloadPDF = async () => {
    if (!profile || !report) return
    
    // Importación dinámica limpia y segura en Next.js
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    
    // Cabecera "FocusPlay"
    doc.setFillColor(78, 205, 196) // Fondo Teal
    doc.rect(0, 0, 210, 35, 'F')
    
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text("FocusPlay", 20, 23)
    
    // Título del Reporte y Metadatos
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text(`Reporte de Progreso Social: ${profile.name}`, 20, 50)
    
    doc.setFontSize(11)
    doc.setTextColor(120, 120, 120)
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 60)
    doc.text(`Interacciones analizadas: ${profile.activityHistory?.length || 0}`, 20, 67)
    
    doc.setDrawColor(220, 220, 220)
    doc.line(20, 75, 190, 75)

    // Contenido del reporte adaptado al ancho de la página
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    const textLines = doc.splitTextToSize(report, 170)
    doc.text(textLines, 20, 85)
    
    // Pie de página
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text("Generado por la IA de FocusPlay - Asistente para padres", 105, 285, { align: "center" })
    
    doc.save(`FocusPlay_Reporte_${profile.name}.pdf`)
  }

  if (!isMounted || !profile) return <main style={S.main} />

  return (
    <main style={S.main}>
      <header style={S.header}>
        <Link href="/" style={S.backBtn}>← volver al inicio</Link>
        <span style={S.title}>Panel de Padres</span>
        <div style={S.placeholder} />
      </header>
      <div style={S.tealLine} />

      <div style={S.body}>
        <div style={S.card}>
          <h1 style={S.pageTitle}>Reporte de IA: {profile.name}</h1>
          <p style={S.pageSub}>
            Genera un reporte analítico de comportamiento basado en las últimas decisiones tomadas por {profile.name} en el módulo Amigos.
          </p>
          
          <div style={S.statsRow}>
            <div style={S.statBox}>
              <span style={S.statLabel}>Interacciones registradas</span>
              <span style={S.statValue}>{profile.activityHistory?.length || 0}</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statLabel}>Nivel de Amigos</span>
              <span style={S.statValue}>{profile.amigosLevel}</span>
            </div>
          </div>

          <button style={S.generateBtn} onClick={handleGenerateReport} disabled={loading}>
            {loading ? "Generando análisis..." : "✨ Generar Reporte de Comportamiento"}
          </button>

          {report && (
            <div style={S.reportBox} className="anim-fadein">
              <h3 style={S.reportBoxTitle}>Análisis de Comportamiento Social</h3>
              <p style={S.reportText}>{report}</p>

              <button style={S.downloadBtn} onClick={handleDownloadPDF}>
                📥 Descargar como PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main:          { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  header:        { padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)" },
  tealLine:      { height: 2, background: "var(--teal)" },
  backBtn:       { background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--muted)", textDecoration: "none" },
  title:         { fontSize: 18, fontWeight: 600, color: "var(--white)" },
  placeholder:   { width: 80 },
  body:          { flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 24px" },
  card:          { background: "var(--bg2)", borderRadius: 20, padding: 32, maxWidth: 640, width: "100%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 24 },
  pageTitle:     { fontSize: 24, fontWeight: 700, margin: 0, color: "var(--white)" },
  pageSub:       { fontSize: 15, color: "var(--muted)", lineHeight: 1.5, margin: 0 },
  statsRow:      { display: "flex", gap: 16 },
  statBox:       { flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 4 },
  statLabel:     { fontSize: 12, textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, letterSpacing: 1 },
  statValue:     { fontSize: 24, color: "var(--teal)", fontWeight: 700 },
  generateBtn:   { background: "var(--teal)", color: "#1C2B3A", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" },
  reportBox:     { background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 16, padding: 24 },
  reportBoxTitle:{ margin: "0 0 12px 0", fontSize: 16, color: "var(--teal)" },
  reportText:    { whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 1.6, margin: 0 },
  downloadBtn:   { background: "rgba(255,255,255,0.1)", color: "var(--white)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", marginTop: 20 }
}
