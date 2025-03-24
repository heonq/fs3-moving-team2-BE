import { NotFoundException } from '@/core/errors';
import QuoteRequestsRepository from '../repository/quoteRequests.repository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { Region, ServiceType } from '@prisma/client';
import QuoteMapper from '@/modules/moverQuotes/mapper/moverQuote.mapper';
import { MOVE_TYPE_KOREAN } from '@/constants/serviceType';

export default class QuoteRequestsService {
  constructor(private quoteRequestRepository: QuoteRequestsRepository) {}

  async createQuoteRequest(customerId: string, data: any) {
    const parseRegion = (address: string): Region => {
      const regionMap: Record<string, Region> = {
        서울: 'SEOUL',
        부산: 'BUSAN',
        대구: 'DAEGU',
        울산: 'ULSAN',
        인천: 'INCHEON',
        광주: 'GWANGJU',
        대전: 'DAEJEON',
        세종: 'SEJONG',
        경기: 'GYEONGGI',
        강원: 'GANGWON',
        충북: 'CHUNGBUK',
        충남: 'CHUNGNAM',
        경북: 'GYEONGBUK',
        경남: 'GYEONGNAM',
        전북: 'JEONBUK',
        전남: 'JEONNAM',
        제주: 'JEJU',
      };
      const firstWord = address.split(' ')[0];
      return regionMap[firstWord] || 'SEOUL'; // 기본값 처리
    };

    const fromRegion = parseRegion(data.moveFrom);
    const toRegion = parseRegion(data.moveTo);

    // 두 번째 단어 이후의 문자열을 추출합니다.
    const fromSecondWord = data.moveFrom.split(' ')[1];
    const toSecondWord = data.moveTo.split(' ')[1];

    // 세 번째 단어 이후의 문자열을 추출합니다.
    const fromRest = data.moveFrom.split(' ').slice(2).join(' ');
    const toRest = data.moveTo.split(' ').slice(2).join(' ');

    // 견적 요청과 함께 두 주소를 같이 생성하도록 Repository에 전달합니다.
    await this.quoteRequestRepository.createQuoteRequest({
      customerId,
      moveType: data.moveType as ServiceType, // enum 값을 맞게 변환
      fromRegion,
      toRegion,
      moveDate: new Date(data.moveDate),
      // 관계를 같이 생성하는 nested create 사용
      quoteRequestAddresses: {
        create: [
          {
            type: 'DEPARTURE',
            sido: fromRegion, // 간단히 지역 값 저장
            sigungu: fromSecondWord,
            street: fromRest,
            fullAddress: data.moveFrom,
          },
          {
            type: 'ARRIVAL',
            sido: toRegion,
            sigungu: toSecondWord,
            street: toRest,
            fullAddress: data.moveTo,
          },
        ],
      },
    });

    return { message: '견적 요청이 성공적으로 생성되었습니다.' };
  }

  async getLatestQuoteRequestForCustomer(customerId: string) {
    // 최근 고객의 견적 요청을 조회
    const quote = await this.quoteRequestRepository.getLatestQuoteRequestForCustomer(customerId);

    if (!quote) {
      return { isRequested: false };
    }

    // active 상태일 때 필요한 정보 매핑
    return {
      isRequested: true,
      quote: {
        id: quote.id,
        movingDate: quote.moveDate,
        // 내부에 저장된 enum값(예: "HOME_MOVE")을 한글로 변환
        movingType: MOVE_TYPE_KOREAN[quote.moveType],
        requestedDate: quote.createdAt,
        arrival: quote.quoteRequestAddresses.find((address) => address.type === 'ARRIVAL')
          ?.fullAddress,
        departure: quote.quoteRequestAddresses.find((address) => address.type === 'DEPARTURE')
          ?.fullAddress,
      },
    };
  }

  async getAllQuoteRequests(page: number, pageSize: number) {
    const data = await this.quoteRequestRepository.getAllQuoteRequests(page, pageSize);

    return {
      list: data.list.map((quote) => QuoteMapper.toQuoteForMoverListDto(quote)),
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  }
}
