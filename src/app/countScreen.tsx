import Slider from '@react-native-community/slider';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  navy: '#12233d',
  navy2: '#1b3255',
  gold: '#b8862f',
  goldLight: '#e3c481',
  paper: '#f6f3ec',
  ink: '#1c1a17',
  line: '#dcd5c5',
  muted: '#6b6558',
  card: '#ffffff',
};

const TENOR_OPTIONS = [6, 12, 24, 36, 48, 60, 84, 120];

function parseRp(str: string) {
  const digits = String(str).replace(/[^\d]/g, '');
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
}

function fmtRp(n: number) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

function fmtRpInput(n: number) {
  if (!n) return '';
  return n.toLocaleString('id-ID');
}

function calcFlat(principal: number, annualRatePct: number, months: number) {
  const totalInterest = principal * (annualRatePct / 100) * (months / 12);
  const totalPay = principal + totalInterest;
  const monthly = totalPay / months;
  const rows = [];
  let sisa = principal;
  const pokokPerBulan = principal / months;
  const bungaPerBulan = totalInterest / months;
  for (let i = 1; i <= months; i++) {
    sisa -= pokokPerBulan;
    rows.push({
      bulan: i,
      angsuran: monthly,
      pokok: pokokPerBulan,
      bunga: bungaPerBulan,
      sisa: Math.max(sisa, 0),
    });
  }
  return { monthly, totalInterest, totalPay, rows };
}

function calcAnuitas(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  let monthly;
  if (r === 0) {
    monthly = principal / months;
  } else {
    monthly =
      (principal * r * Math.pow(1 + r, months)) /
      (Math.pow(1 + r, months) - 1);
  }
  const rows = [];
  let sisa = principal;
  let totalInterest = 0;
  for (let i = 1; i <= months; i++) {
    const bunga = sisa * r;
    const pokok = monthly - bunga;
    sisa -= pokok;
    totalInterest += bunga;
    rows.push({ bulan: i, angsuran: monthly, pokok, bunga, sisa: Math.max(sisa, 0) });
  }
  return { monthly, totalInterest, totalPay: principal + totalInterest, rows };
}

// Button PDF
function buildPdfHtml(p: {
  principal: number;
  rate: number;
  months: number;
  method: string;
  result: {
    monthly: number;
    totalInterest: number;
    totalPay: number;
    rows: any[];
  };
}) {
  const { principal, rate, months, method, result } = p;
  const rowsHtml = result.rows
    .map(
      (r) => `
      <tr>
        <td class="c">${r.bulan}</td>
        <td>${fmtRp(r.angsuran)}</td>
        <td>${fmtRp(r.pokok)}</td>
        <td>${fmtRp(r.bunga)}</td>
        <td>${fmtRp(r.sisa)}</td>
      </tr>`
    )
    .join('');

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Helvetica, Arial, sans-serif; color: #1c1a17; padding: 24px; }
        h1 { color: #12233d; margin-bottom: 4px; }
        .sub { color: #6b6558; margin-bottom: 20px; font-size: 13px; }
        .summary { background: #12233d; color: #fff; padding: 16px; border-radius: 6px; margin-bottom: 20px; }
        .summary .big { color: #e3c481; font-size: 26px; font-weight: bold; margin: 4px 0 10px; }
        .summary table { width: 100%; font-size: 13px; }
        .summary td { padding: 3px 0; }
        .summary td:last-child { text-align: right; font-weight: bold; }
        table.detail { width: 100%; border-collapse: collapse; font-size: 11px; }
        table.detail th { background: #f6f3ec; text-align: right; padding: 6px; border: 1px solid #dcd5c5; }
        table.detail td { text-align: right; padding: 5px 6px; border: 1px solid #dcd5c5; }
        .c { text-align: center !important; }
        .foot { margin-top: 16px; font-size: 10px; color: #6b6558; }
      </style>
    </head>
    <body>
      <h1>Simulasi Kredit</h1>
      <div class="sub">
        Metode ${method === 'flat' ? 'Flat' : 'Efektif (Anuitas)'} &middot;
        Bunga ${rate.toFixed(1)}% per tahun &middot; Tenor ${months} bulan
      </div>

      <div class="summary">
        <div>Estimasi angsuran per bulan</div>
        <div class="big">${fmtRp(result.monthly)}</div>
        <table>
          <tr><td>Pokok pinjaman</td><td>${fmtRp(principal)}</td></tr>
          <tr><td>Total bunga</td><td>${fmtRp(result.totalInterest)}</td></tr>
          <tr><td>Total pembayaran</td><td>${fmtRp(result.totalPay)}</td></tr>
        </table>
      </div>

      <table class="detail">
        <thead>
          <tr>
            <th>Bulan</th><th>Angsuran</th><th>Pokok</th><th>Bunga</th><th>Sisa pokok</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="foot">
        Hasil ini adalah simulasi dan dapat berbeda dari penawaran resmi lembaga
        pembiayaan, yang biasanya menambahkan biaya administrasi, provisi, dan asuransi.
      </div>
    </body>
  </html>`;
}

export default function countScreen() {
  const [principalStr, setPrincipalStr] = useState('50.000.000');
  const [rate, setRate] = useState(9.5);
  const [months, setMonths] = useState(24);
  const [method, setMethod] = useState('anuitas');
  const [showTable, setShowTable] = useState(false);

  const principal = parseRp(principalStr);

  const result = useMemo(() => {
    if (principal <= 0 || months <= 0)
      return { monthly: 0, totalInterest: 0, totalPay: 0, rows: [] as any[] };
    return method === 'flat'
      ? calcFlat(principal, rate, months)
      : calcAnuitas(principal, rate, months);
  },
  [principal, rate, months, method]);

const [exporting, setExporting] = useState(false);

const handleExportPdf = async () => {
  if (result.rows.length === 0) {
    Alert.alert('Data kosong', 'Isi jumlah pinjaman terlebih dahulu.');
    return;
  }
  try {
    setExporting(true);
    const html = buildPdfHtml({ principal, rate, months, method, result });

    if (Platform.OS === 'web') {
      await Print.printAsync({ html }); // di web membuka dialog print/save as PDF
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Simpan atau bagikan PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('PDF dibuat', uri);
    }
  } catch (e) {
    Alert.alert('Gagal', 'PDF tidak bisa dibuat. Coba lagi.');
  } finally {
    setExporting(false);
  }
};


  

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandRow}>
          <Text style={styles.brandMark}>Kalkulator Kredit</Text>
        </View>

        <Text style={styles.h1}>Hitung cicilan sebelum mengajukan pinjaman</Text>
        <Text style={styles.lede}>
          Masukkan jumlah pinjaman, bunga, dan tenor untuk melihat estimasi
          angsuran bulanan dan rincian pembayaran.
        </Text>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Jumlah pinjaman</Text>
            <View style={styles.rpInput}>
              <Text style={styles.rpPrefix}>Rp</Text>
              <TextInput
                style={styles.rpTextInput}
                keyboardType="numeric"
                value={principalStr}
                onChangeText={(t) => setPrincipalStr(fmtRpInput(parseRp(t)))}
                placeholder="0"
                placeholderTextColor={COLORS.muted}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Suku bunga per tahun</Text>
            <View style={styles.rateRow}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={30}
                step={0.1}
                value={rate}
                onValueChange={setRate}
                minimumTrackTintColor={COLORS.gold}
                maximumTrackTintColor={COLORS.line}
                thumbTintColor={COLORS.gold}
              />
              <Text style={styles.rateVal}>{rate.toFixed(1)}%</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tenor (bulan)</Text>
            <View style={styles.tenorGrid}>
              {TENOR_OPTIONS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMonths(m)}
                  style={[styles.tenorBtn, months === m && styles.tenorBtnActive]}
                >
                  <Text
                    style={[
                      styles.tenorBtnText,
                      months === m && styles.tenorBtnTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Metode bunga</Text>
            <View style={styles.methodRow}>
              <Pressable
                onPress={() => setMethod('anuitas')}
                style={[styles.methodBtn, method === 'anuitas' && styles.methodBtnActive]}
              >
                <Text style={styles.methodTitle}>Efektif (Anuitas)</Text>
                <Text style={styles.methodSub}>Bunga dihitung dari sisa pokok</Text>
              </Pressable>
              <Pressable
                onPress={() => setMethod('flat')}
                style={[styles.methodBtn, method === 'flat' && styles.methodBtnActive]}
              >
                <Text style={styles.methodTitle}>Flat</Text>
                <Text style={styles.methodSub}>Bunga tetap tiap bulan</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Estimasi angsuran per bulan</Text>
          <Text style={styles.resultFigure}>{fmtRp(result.monthly)}</Text>
          <Text style={styles.resultSub}>
            selama {months} bulan &middot; metode{' '}
            {method === 'flat' ? 'flat' : 'efektif (anuitas)'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pokok pinjaman</Text>
            <Text style={styles.statValue}>{fmtRp(principal)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total bunga</Text>
            <Text style={styles.statValue}>{fmtRp(result.totalInterest)}</Text>
          </View>
          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statLabel}>Total pembayaran</Text>
            <Text style={styles.statValue}>{fmtRp(result.totalPay)}</Text>
          </View>
        </View>

        <View style={styles.tableWrap}>
          <View style={styles.tableHead}>
            <Text style={styles.tableHeadTitle}>Rincian angsuran</Text>
            <Pressable onPress={() => setShowTable((s) => !s)}>
              <Text style={styles.toggleDetail}>
                {showTable ? 'Sembunyikan' : 'Lihat per bulan'}
              </Text>
            </Pressable>
          </View>

          {showTable && (
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.th, styles.colBulan]}>Bulan</Text>
                <Text style={[styles.th, styles.colMoney]}>Angsuran</Text>
                <Text style={[styles.th, styles.colMoney]}>Pokok</Text>
                <Text style={[styles.th, styles.colMoney]}>Bunga</Text>
                <Text style={[styles.th, styles.colMoney]}>Sisa pokok</Text>
              </View>
              <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled>
                {result.rows.map((row) => (
                  <View key={row.bulan} style={styles.tableRow}>
                    <Text style={[styles.td, styles.colBulan]}>{row.bulan}</Text>
                    <Text style={[styles.td, styles.colMoney]}>{fmtRp(row.angsuran)}</Text>
                    <Text style={[styles.td, styles.colMoney]}>{fmtRp(row.pokok)}</Text>
                    <Text style={[styles.td, styles.colMoney]}>{fmtRp(row.bunga)}</Text>
                    <Text style={[styles.td, styles.colMoney]}>{fmtRp(row.sisa)}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

 

        <Text style={styles.footNote}>
          Hasil ini adalah simulasi dan dapat berbeda dari penawaran resmi
          lembaga pembiayaan, yang biasanya menambahkan biaya administrasi,
          provisi, dan asuransi.
        </Text>
      </ScrollView>

             <Pressable
  onPress={handleExportPdf}
  disabled={exporting}
  style={[styles.pdfButton, exporting && { opacity: 0.6 }]}
>
  <Text style={styles.pdfButtonText}>
    {exporting ? 'Membuat PDF...' : 'Unduh PDF'}
  </Text>
</Pressable>
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.paper },
  container: { padding: 20, paddingBottom: 48 },
  brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  brandMark: { fontSize: 26, fontWeight: '700', color: COLORS.navy },
  h1: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.ink,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 32,
  },
  lede: { fontSize: 15, color: COLORS.muted, lineHeight: 22, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 20,
    marginBottom: 16,
  },
  field: { marginBottom: 20 },
  label: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  rpInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.line,
    paddingBottom: 6,
  },
  rpPrefix: { fontSize: 17, color: COLORS.muted, marginRight: 6 },
  rpTextInput: {
    flex: 1,
    fontSize: 19,
    fontWeight: '500',
    color: COLORS.ink,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slider: { flex: 1, height: 40 },
  rateVal: { fontSize: 18, fontWeight: '600', minWidth: 58, textAlign: 'right', color: COLORS.ink },
  tenorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tenorBtn: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  tenorBtnActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  tenorBtnText: { fontSize: 13.5, color: COLORS.ink },
  tenorBtnTextActive: { color: '#fff' },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 4,
    padding: 12,
  },
  methodBtnActive: { borderColor: COLORS.gold, backgroundColor: 'rgba(184,134,47,0.08)' },
  methodTitle: { fontSize: 14, fontWeight: '600', color: COLORS.ink, marginBottom: 2 },
  methodSub: { fontSize: 12, color: COLORS.muted },
  resultCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    padding: 22,
    marginBottom: 16,
  },
  resultLabel: { fontSize: 12.5, color: '#c8bfa5', marginBottom: 4 },
  resultFigure: { fontSize: 32, fontWeight: '700', color: COLORS.goldLight, marginBottom: 2 },
  resultSub: { fontSize: 12.5, color: '#9aa3b5', marginBottom: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: 4 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: 14, color: '#b7bdc9' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  tableWrap: { marginTop: 4 },
  tableHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableHeadTitle: { fontSize: 17, fontWeight: '600', color: COLORS.ink },
  toggleDetail: { fontSize: 13, color: COLORS.gold, textDecorationLine: 'underline' },
  table: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 6, overflow: 'hidden' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderRow: { backgroundColor: COLORS.paper },
  th: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  td: { fontSize: 12.5, color: COLORS.ink },
  colBulan: { width: 44 },
  colMoney: { flex: 1, textAlign: 'right' },
  footNote: { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginTop: 18 },

  pdfButton: {
  backgroundColor: COLORS.gold,
  borderRadius: 6,
  paddingVertical: 14,
  alignItems: 'center',
  marginTop: 16,
},
pdfButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});